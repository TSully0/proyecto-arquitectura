import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { categories } from '../../categories/entities/categories.entity.js';
import { users } from '../../users/entities/users.entity.js';

export enum PriceRange {
  CHEAP = 'CHEAP',
  MODERATE = 'MODERATE',
  EXPENSIVE = 'EXPENSIVE',
}

@Entity('places')
export class places {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  openingHours: string;

  @Column({
    type: 'enum',
    enum: PriceRange,
    default: PriceRange.MODERATE,
  })
  priceRange: PriceRange;

  @Column({ type: 'boolean', default: false })
  hasStudentDiscount: boolean;

  @Column({ type: 'boolean', default: false })
  isStudyFriendly: boolean;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  // FK hacia Categories
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => categories, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: categories;

  // FK hacia Users
  @Column({ type: 'uuid', nullable: true })
  authorId: string;

  @ManyToOne(() => users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'authorId' })
  author: users;

  @Column({ type: 'boolean', default: true, nullable: true })
  hasWifi: boolean;

  @Column({ type: 'boolean', default: true, nullable: true })
  isOpen: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  isPetFriendly: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  isAccessible: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  isNightSpot: boolean;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 5.0,
    nullable: true,
  })
  averageRating: number;

  @Column({ type: 'int', default: 0, nullable: true })
  totalReviews: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}