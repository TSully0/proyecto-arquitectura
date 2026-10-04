import { Type } from 'class-transformer';
import {
	IsInt,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	Min,
	MinLength,
} from 'class-validator';

export class CreateCategoryDto {
	@IsString()
	@MinLength(2)
	@MaxLength(80)
	name!: string;

	@IsString()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	@MaxLength(80)
	slug!: string;

	@IsOptional()
	@IsString()
	@MaxLength(80)
	icon?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	displayOrder?: number;
}

export class UpdateCategoryDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(80)
	name?: string;

	@IsOptional()
	@IsString()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	@MaxLength(80)
	slug?: string;

	@IsOptional()
	@IsString()
	@MaxLength(80)
	icon?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	displayOrder?: number;
}