import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { places } from '../../places/entities/places.entity.js';
import { UserEntity } from '../../users/entities/users.entity.js';

@Entity('user_favorites')
export class user_favorites {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'uuid' })
  placeId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  UserEntity: UserEntity;

  @ManyToOne(() => places, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placeId' })
  places: places;
}