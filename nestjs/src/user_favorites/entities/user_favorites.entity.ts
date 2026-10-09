import { Column, Entity, ManyToOne, JoinColumn, CreateDateColumn, Unique, PrimaryColumn } from "typeorm";
import { places } from "../../places/entities/places.entity.js";
import { UserEntity } from "../../users/entities/users.entity.js";

@Entity('user_favorites')
@Unique(['places','UserEntity'])
export class user_favorites{
    @PrimaryColumn({type:'uuid'})
    placeId: string;

    @PrimaryColumn({type: 'uuid'})
    userId: string;

    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;
    
    @ManyToOne(()=>places , {onDelete: 'CASCADE'})
    @JoinColumn({name: 'placeId'})
    places: places;

    @ManyToOne(()=>UserEntity , {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    UserEntity: UserEntity;

}