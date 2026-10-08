import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  STUDENT = 'STUDENT',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'users', schema: 'public' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ name: 'passwordHash', type: 'text', select: false })
  passwordHash!: string;

  @Column({ name: 'fullName', type: 'text' })
  fullName!: string;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'Role',
    default: Role.STUDENT,
  })
  role!: Role;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt!: Date;
}
