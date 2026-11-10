import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { User } from '../users/user.entity.js';
import { Bathroom } from './bathroom.entity.js';

// One rating per user per bathroom. Ratings without a user (made before accounts existed) never collide.
@Index(['bathroom', 'user'], { unique: true })
@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  /** 1 to 10. */
  @Column({ type: 'tinyint', unsigned: true })
  score: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comment: string | null;

  /** Who rated; null for ratings made before accounts existed. */
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: Relation<User> | null;

  @Index()
  @ManyToOne(() => Bathroom, (bathroom) => bathroom.ratings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  bathroom: Relation<Bathroom>;

  @CreateDateColumn()
  createdAt: Date;
}
