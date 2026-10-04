import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export enum UserRole {
	STUDENT = 'STUDENT',
	MODERATOR = 'MODERATOR',
	ADMIN = 'ADMIN',
}

export class RegisterUserDto {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(8)
	password!: string;

	@IsString()
	@MinLength(3)
	fullName!: string;
}

export class LoginUserDto {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(1)
	password!: string;
}

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(3)
	fullName?: string;

	@IsOptional()
	@IsString()
	@MinLength(8)
	password?: string;
}

export class UpdateUserRoleDto {
	@IsEnum(UserRole)
	role!: UserRole;
}

export class UpdateUserStatusDto {
	@IsBoolean()
	isActive!: boolean;
}

export class UsersQueryDto {
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	page?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	limit?: number;
}