import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';
import { Bathroom } from '../bathrooms/bathroom.entity.js';
import { BathroomsService } from '../bathrooms/bathrooms.service.js';
import { recalculateRatingStats } from '../bathrooms/rating-stats.js';
import { Rating } from '../bathrooms/rating.entity.js';
import { User } from '../users/user.entity.js';
import { PageQueryDto } from './dto/page-query.dto.js';
import { UpdateBathroomDto } from './dto/update-bathroom.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';
import { lastDays } from './stats-days.js';

/** How many days the "ratings per day" chart shows. */
const CHART_DAYS = 30;
/** How many rows the dashboard's "recent ratings" table shows. */
const RECENT_RATINGS = 5;
/** The highest score a user can give. */
const MAX_SCORE = 10;

/** The shape the admin web app receives for a rating (it includes who made it and for which bathroom). */
const toAdminRating = (rating: Rating) => ({
  id: rating.id,
  score: rating.score,
  comment: rating.comment,
  createdAt: rating.createdAt,
  bathroom: { id: rating.bathroom.id, name: rating.bathroom.name },
  // Ratings made before accounts existed have no user.
  userEmail: rating.user?.email ?? null,
});

/**
 * Limits a query to one page of results.
 * With 10 rows per page, page 1 skips 0 rows, page 2 skips 10, page 3 skips 20...
 * so the rows to skip are (page - 1) * pageSize, and then we take pageSize rows.
 */
function paginate<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  { page, pageSize }: PageQueryDto,
) {
  return query.skip((page - 1) * pageSize).take(pageSize);
}

/**
 * A free bathroom has no price. A paid one needs a price: the new one if sent,
 * otherwise the one it already had.
 */
function resolvePrice(
  isFree: boolean,
  newPrice: number | undefined,
  currentPrice: string | null,
) {
  if (isFree) return null;

  const price = newPrice !== undefined ? String(newPrice) : currentPrice;
  if (price === null) {
    throw new BadRequestException({
      statusCode: 400,
      error: 'Bad Request',
      message: 'A paid bathroom needs a price',
    });
  }
  return price;
}

/** Everything the admin web app can do: dashboard numbers, and managing bathrooms and ratings. */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Bathroom)
    private readonly bathrooms: Repository<Bathroom>,
    @InjectRepository(Rating) private readonly ratings: Repository<Rating>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly bathroomsService: BathroomsService,
  ) {}

  // ───────────────────────── Dashboard ────────────────────────-

  /**
   * All the numbers of the dashboard. Each piece is computed by its own small
   * method below; they run at the same time because they don't depend on each other.
   *
   * `tzOffset` is the admin's UTC offset in minutes, used to count ratings per
   * day of the admin's own timezone.
   */
  async stats(tzOffset: number) {
    const [
      totals,
      ratingsPerDay,
      bathroomsByCategory,
      scoreDistribution,
      recent,
    ] = await Promise.all([
      this.totals(),
      this.ratingsPerDay(tzOffset),
      this.bathroomsByCategory(),
      this.scoreDistribution(),
      this.listRatings({ page: 1, pageSize: RECENT_RATINGS }),
    ]);

    return {
      totals,
      ratingsPerDay,
      bathroomsByCategory,
      scoreDistribution,
      recentRatings: recent.items,
    };
  }

  /** The four big numbers on top of the dashboard. */
  private async totals() {
    const [bathrooms, users, ratings, average] = await Promise.all([
      this.bathrooms.count(),
      this.users.count(),
      this.ratings.count(),
      this.ratings.average('score'), // null when there are no ratings yet
    ]);

    return {
      bathrooms,
      users,
      ratings,
      averageScore: average === null ? null : Number(average.toFixed(2)),
    };
  }

  /** How many ratings were made on each of the last days, one entry per day (today last). */
  private async ratingsPerDay(tzOffset: number) {
    const { days, since } = lastDays(CHART_DAYS, tzOffset);

    const rows = await this.ratings
      .createQueryBuilder('r')
      // Shift each timestamp by the admin's offset and keep only its date, e.g. "2026-11-06".
      .select(
        "DATE_FORMAT(DATE_ADD(r.createdAt, INTERVAL :tzOffset MINUTE), '%Y-%m-%d')",
        'day',
      )
      .addSelect('COUNT(*)', 'count')
      .where('r.createdAt >= :since', { since }) // only the chart's range
      .setParameter('tzOffset', tzOffset)
      .groupBy('day')
      .getRawMany<{ day: string; count: string }>();

    // The database only returns days that have ratings. Fill the others with 0
    // so the chart always has one bar for every day.
    const countByDay = new Map(rows.map((r) => [r.day, Number(r.count)]));
    return days.map((day) => ({ day, count: countByDay.get(day) ?? 0 }));
  }

  /** How many bathrooms there are of each category. */
  private async bathroomsByCategory() {
    const rows = await this.bathrooms
      .createQueryBuilder('b')
      .select('b.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('b.category')
      .getRawMany<{ category: string; count: string }>();

    return rows.map((r) => ({ category: r.category, count: Number(r.count) }));
  }

  /** How many ratings there are of each score, for every score from 1 to 10. */
  private async scoreDistribution() {
    const rows = await this.ratings
      .createQueryBuilder('r')
      .select('r.score', 'score')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.score')
      .getRawMany<{ score: number; count: string }>();

    // Include the scores nobody used (count 0), so all ten bars are drawn.
    const countByScore = new Map(
      rows.map((r) => [Number(r.score), Number(r.count)]),
    );
    return Array.from({ length: MAX_SCORE }, (_, i) => ({
      score: i + 1,
      count: countByScore.get(i + 1) ?? 0,
    }));
  }

  // ───────────────────────── Bathrooms ─────────────────────────

  /** One page of bathrooms, newest first, optionally filtered by name. */
  async listBathrooms(query: PageQueryDto) {
    const { page, pageSize, search } = query;

    const bathrooms = this.bathrooms
      .createQueryBuilder('b')
      .orderBy('b.createdAt', 'DESC')
      .addOrderBy('b.id', 'DESC'); // keeps the order stable when dates are equal
    if (search)
      bathrooms.where('b.name LIKE :search', { search: `%${search}%` });

    // `total` is the number of matches across ALL pages (the web app shows "N results").
    const [items, total] = await paginate(bathrooms, query).getManyAndCount();
    return { items, total, page, pageSize };
  }

  /**
   * Changes only the fields that were sent. The rest stay as they are.
   * Rules: a moved bathroom can't end up within 20 m of another one, and a paid
   * bathroom needs a price.
   */
  async updateBathroom(id: number, dto: UpdateBathroomDto) {
    // 1. The bathroom must exist.
    const bathroom = await this.bathrooms.findOneBy({ id });
    if (!bathroom) throw new NotFoundException(`Bathroom ${id} not found`);

    // 2. Location: keep the current one unless a new one was sent.
    const latitude = dto.latitude ?? bathroom.latitude;
    const longitude = dto.longitude ?? bathroom.longitude;
    const wasMoved = dto.latitude !== undefined || dto.longitude !== undefined;
    if (wasMoved) {
      // The last argument ignores this bathroom itself, so it can't clash with its own old spot.
      await this.bathroomsService.assertNoBathroomNearby(
        latitude,
        longitude,
        id,
      );
    }

    // 3. Cost: free or paid, and the price that goes with it.
    const isFree = dto.isFree ?? bathroom.isFree;
    const price = resolvePrice(isFree, dto.price, bathroom.price);

    // 4. Apply the changes and save.
    Object.assign(bathroom, {
      name: dto.name ?? bathroom.name,
      // undefined = leave the address as it is; null or empty text = remove it.
      address:
        dto.address === undefined
          ? bathroom.address
          : dto.address?.trim() || null,
      category: dto.category ?? bathroom.category,
      latitude,
      longitude,
      isFree,
      price,
    });
    return this.bathrooms.save(bathroom);
  }

  /** Also removes the bathroom's ratings (the database cascades the delete). */
  async deleteBathroom(id: number) {
    const result = await this.bathrooms.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Bathroom ${id} not found`);
  }

  // ───────────────────────── Ratings ─────────────────────────

  /** One page of ratings, newest first, optionally filtered by bathroom name, user email or comment. */
  async listRatings(query: PageQueryDto) {
    const { page, pageSize, search } = query;

    const ratings = this.ratings
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.bathroom', 'b') // every rating has a bathroom
      .leftJoinAndSelect('r.user', 'u') // but old ratings have no user (left join keeps them)
      .orderBy('r.createdAt', 'DESC')
      .addOrderBy('r.id', 'DESC');
    if (search) {
      ratings.where(
        '(b.name LIKE :search OR u.email LIKE :search OR r.comment LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await paginate(ratings, query).getManyAndCount();
    return { items: items.map(toAdminRating), total, page, pageSize };
  }

  /** Changes the score and/or comment of a rating, then recalculates the bathroom's average. */
  async updateRating(id: number, dto: UpdateRatingDto) {
    // A transaction: either the rating AND the average are saved, or neither is.
    return this.dataSource.transaction(async (manager) => {
      const rating = await manager.findOne(Rating, {
        where: { id },
        relations: { bathroom: true, user: true },
      });
      if (!rating) throw new NotFoundException(`Rating ${id} not found`);

      if (dto.score !== undefined) rating.score = dto.score;
      // undefined = leave the comment; null or empty text = remove it.
      if (dto.comment !== undefined)
        rating.comment = dto.comment?.trim() || null;
      await manager.save(rating);

      await recalculateRatingStats(manager, rating.bathroom.id);
      return toAdminRating(rating);
    });
  }

  /** Deletes a rating, then recalculates the bathroom's average (all in one transaction). */
  async deleteRating(id: number) {
    await this.dataSource.transaction(async (manager) => {
      const rating = await manager.findOne(Rating, {
        where: { id },
        relations: { bathroom: true },
      });
      if (!rating) throw new NotFoundException(`Rating ${id} not found`);

      await manager.remove(rating);
      await recalculateRatingStats(manager, rating.bathroom.id);
    });
  }
}
