import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';

@Entity('categories')
export class categories{
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({unique: true})
    name: string;
    @Column({unique:true})
    slug: string;
    @Column({nullable: true})
    icon: string;
    @Column({ name: 'displayOrder', default: 0 })
    displayOrder: number;
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}