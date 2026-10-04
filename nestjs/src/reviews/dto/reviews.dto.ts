import { Type } from 'class-transformer';
import {
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

export class CreateReviewDto {
	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number | null;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	comment?: string;

	@IsUUID()
	placeId!: string;
}

export class UpdateReviewDto {
	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number | null;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	comment?: string;
}

export class ReviewsQueryDto {
	@IsOptional()
	@IsUUID()
	placeId?: string;

	@IsOptional()
	@IsUUID()
	userId?: string;

	@IsOptional()
	@IsDateString()
	createdAfter?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}