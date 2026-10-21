import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { places } from '../../places/entities/places.entity.js';
import { UserEntity } from '../../users/entities/users.entity.js';

@Entity('reviews')
export class reviewsentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column('uuid')
  placeId: string;

  @Column({ type: 'text', default: 'Estudiante Manta' })
  authorName: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  User: UserEntity;

  @ManyToOne(() => places, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placeId' })
  places: places;
}