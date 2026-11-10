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

/** A 6-digit code emailed to the user to reset the password. Only its hash is stored. */
@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  user: Relation<User>;

  @Column({ length: 64 })
  codeHash: string;

  @Column()
  expiresAt: Date;

  /** Wrong codes entered so far. */
  @Column({ default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;
}
