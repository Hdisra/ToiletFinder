import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Rating } from './rating.entity.js';

export enum BathroomCategory {
  MALL = 'mall',
  SUPERMARKET = 'supermarket',
  PARK = 'park',
  RESTAURANT = 'restaurant',
  GAS_STATION = 'gas_station',
  PUBLIC = 'public',
  OTHER = 'other',
}

@Entity()
export class Bathroom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({
    type: 'enum',
    enum: BathroomCategory,
    default: BathroomCategory.OTHER,
  })
  category: BathroomCategory;

  @Index()
  @Column({ type: 'double' })
  latitude: number;

  @Index()
  @Column({ type: 'double' })
  longitude: number;

  @Column({ default: true })
  isFree: boolean;

  /** Only meaningful when `isFree` is false. */
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  price: string | null;

  /** Denormalized from `ratings`; updated whenever a rating is added. */
  // 4 digits (2 decimals) so the maximum average, 10.00, fits.
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  averageRating: string | null;

  @Column({ default: 0 })
  ratingCount: number;

  @OneToMany(() => Rating, (rating) => rating.bathroom)
  ratings: Relation<Rating[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
