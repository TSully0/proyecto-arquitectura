import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique} from 'typeorm';
import {places} from '../../places/entities/places.entity.js'


@Entity('place_likes')
@Unique(['placeId'])
export class place_likes{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'uuid'})
    placeId: string;

    @Column({type: 'text'})
    clientId: string;

    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;

    @ManyToOne(()=> places, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'placeid'})
    places: places;
}