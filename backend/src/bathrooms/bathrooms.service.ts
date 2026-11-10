import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Bathroom } from './bathroom.entity.js';
import { CreateBathroomDto } from './dto/create-bathroom.dto.js';
import { CreateRatingDto } from './dto/create-rating.dto.js';
import { FindNearbyDto } from './dto/find-nearby.dto.js';
import { recalculateRatingStats } from './rating-stats.js';
import { Rating } from './rating.entity.js';

/** Earth's radius in meters, used to turn angles on the globe into distances. */
const EARTH_RADIUS_M = 6371000;

/** A new bathroom can't be registered closer than this to an existing one. */
export const MIN_DISTANCE_BETWEEN_BATHROOMS_M = 20;

/** The nearby search returns at most this many bathrooms (the closest ones). */
const MAX_NEARBY_RESULTS = 50;

/** The ratings list of a bathroom shows at most this many (the newest ones). */
const MAX_RATINGS_LISTED = 50;

/**
 * SQL that gives the distance in meters between a bathroom and a point on the map.
 *
 * It is the "haversine" formula: the straight-line distance between two latitude/longitude
 * points measured along the curved surface of the Earth.
 *
 * - `alias` is the name given to the bathroom table in the query (e.g. 'b').
 * - `:lat` and `:lng` are the point we measure from. Whoever uses this text must set them,
 *   with `.setParameters({ lat, lng })`.
 */
const distanceSql = (alias: string) => `(${EARTH_RADIUS_M} * 2 * ASIN(SQRT(
  POWER(SIN(RADIANS(${alias}.latitude - :lat) / 2), 2) +
  COS(RADIANS(:lat)) * COS(RADIANS(${alias}.latitude)) *
  POWER(SIN(RADIANS(${alias}.longitude - :lng) / 2), 2)
)))`;

/** What the API shows of a rating. It leaves out who made it, so users stay private. */
const toRatingView = (rating: Rating) => ({
  id: rating.id,
  score: rating.score,
  comment: rating.comment,
  createdAt: rating.createdAt,
});

/** Reading bathrooms, and the ratings that logged-in users give them. */
@Injectable()
export class BathroomsService {
  constructor(
    @InjectRepository(Bathroom)
    private readonly bathrooms: Repository<Bathroom>,
    @InjectRepository(Rating)
    private readonly ratings: Repository<Rating>,
    private readonly dataSource: DataSource,
  ) {}

  // ───────────────────────── Bathrooms ─────────────────────────

  /**
   * The bathrooms within `radius` meters of a point, closest first.
   * Each one comes with its `distance` in meters. Paid bathrooms only appear
   * when `includePaid` is true.
   */
  async findNearby({ lat, lng, radius, includePaid }: FindNearbyDto) {
    const distance = distanceSql('b');

    const query = this.bathrooms
      .createQueryBuilder('b')
      .addSelect(distance, 'distance') // calculate the distance of every bathroom...
      .setParameters({ lat, lng, radius })
      .where(`${distance} <= :radius`) // ...keep the ones that are close enough...
      .orderBy('distance', 'ASC') // ...and put the closest first
      .limit(MAX_NEARBY_RESULTS);

    if (!includePaid) query.andWhere('b.isFree = :free', { free: true });

    // `entities` are the bathrooms and `raw` the matching rows with the extra
    // `distance` column; both come in the same order, so index i is the same bathroom.
    const { entities, raw } = await query.getRawAndEntities();
    return entities.map((bathroom, i) =>
      Object.assign(bathroom, {
        distance: Math.round(Number(raw[i].distance)),
      }),
    );
  }

  /**
   * One bathroom by id, or a 404 if it doesn't exist.
   * Pass `db` (a transaction's manager) to run the lookup inside that transaction.
   */
  async findOne(id: number, db: EntityManager = this.dataSource.manager) {
    const bathroom = await db.findOneBy(Bathroom, { id });
    if (!bathroom) throw new NotFoundException(`Bathroom ${id} not found`);
    return bathroom;
  }

  /**
   * Throws 409 if another bathroom is closer than the minimum distance to this point.
   * `exceptId` skips one bathroom, so an edited bathroom doesn't clash with its own old spot.
   */
  async assertNoBathroomNearby(lat: number, lng: number, exceptId?: number) {
    const query = this.bathrooms
      .createQueryBuilder('b')
      .select('b.id') // we only need to know if one exists
      .setParameters({ lat, lng })
      .where(`${distanceSql('b')} <= :min`, {
        min: MIN_DISTANCE_BETWEEN_BATHROOMS_M,
      });
    if (exceptId !== undefined) {
      query.andWhere('b.id != :exceptId', { exceptId });
    }

    if (await query.getOne()) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        code: 'BATHROOM_TOO_CLOSE', // the apps turn this code into a message
        message: `A bathroom is already registered within ${MIN_DISTANCE_BETWEEN_BATHROOMS_M} m`,
      });
    }
  }

  /** Creates a bathroom, as long as no other one is within the minimum distance. */
  async create(dto: CreateBathroomDto) {
    await this.assertNoBathroomNearby(dto.latitude, dto.longitude);

    const isFree = dto.isFree ?? true; // free unless the request says otherwise
    return this.bathrooms.save(
      this.bathrooms.create({
        name: dto.name,
        address: dto.address || null,
        category: dto.category,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isFree,
        // A free bathroom never keeps a price, even if one was sent.
        price: isFree ? null : String(dto.price),
      }),
    );
  }

  // ───────────────────────── Ratings ─────────────────────────

  /** The newest ratings of a bathroom (404 if the bathroom doesn't exist). */
  async findRatings(bathroomId: number) {
    await this.findOne(bathroomId);

    const ratings = await this.ratings.find({
      where: { bathroom: { id: bathroomId } },
      order: { createdAt: 'DESC', id: 'DESC' }, // newest first
      take: MAX_RATINGS_LISTED,
    });
    return ratings.map(toRatingView);
  }

  /** The rating this user gave to this bathroom, or a 404 if they haven't rated it. */
  async findMyRating(bathroomId: number, userId: number) {
    await this.findOne(bathroomId);

    const rating = await this.findUserRating(bathroomId, userId);
    if (!rating) {
      throw new NotFoundException('The user has not rated the bathroom');
    }
    return toRatingView(rating);
  }

  /**
   * Saves the user's rating of a bathroom. Each user has one rating per bathroom:
   * the first call creates it and later calls change it.
   */
  async saveMyRating(bathroomId: number, userId: number, dto: CreateRatingDto) {
    // Everything inside is one transaction: the rating and the bathroom's new
    // average are saved together, or (if anything fails) neither is.
    return this.dataSource.transaction(async (db) => {
      // 1. The bathroom must exist.
      await this.findOne(bathroomId, db);

      // 2. Change the user's existing rating, or create their first one.
      const comment = dto.comment || null; // no comment (or only spaces) is stored as null
      const existing = await this.findUserRating(bathroomId, userId, db);
      const rating = existing
        ? Object.assign(existing, { score: dto.score, comment })
        : db.create(Rating, {
            score: dto.score,
            comment,
            user: { id: userId },
            bathroom: { id: bathroomId },
          });
      await db.save(rating);

      // 3. The bathroom's stored average and count are now outdated: recalculate them.
      await recalculateRatingStats(db, bathroomId);

      return toRatingView(rating);
    });
  }

  /** Looks up the rating of one user for one bathroom (null if there is none). */
  private findUserRating(
    bathroomId: number,
    userId: number,
    db: EntityManager = this.dataSource.manager,
  ) {
    return db.findOneBy(Rating, {
      bathroom: { id: bathroomId },
      user: { id: userId },
    });
  }
}
