import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';

export enum Role{
    STUDENT = 'STUDENT',
    ADMIN = 'ADMIN',
    USER = 'USER'
}
@Entity('users')
export class users{
    @PrimaryGeneratedColumn('uuid')
        id: string;
    @Column({unique: true})
    email: string;
    @Column({name: 'passwordHash', select:false})
    passwordHash: string; 
    @Column({name: 'fullName'})
    fullName: string;
    @Column({type:'enum', enum: Role, enumName: 'Role',default: Role.STUDENT})
    role: Role;
    @Column({default: true})
    isActive: boolean;
    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;
}

