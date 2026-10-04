import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	IsUUID,
	Max,
	MaxLength,
	Min,
	MinLength,
} from 'class-validator';

export enum PlacePriceRange {
	CHEAP = 'CHEAP',
	MODERATE = 'MODERATE',
	EXPENSIVE = 'EXPENSIVE',
}

export class CreatePlaceDto {
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	name!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(2000)
	description!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(250)
	address!: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-90)
	@Max(90)
	latitude?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-180)
	@Max(180)
	longitude?: number;

	@IsOptional()
	@IsString()
	@MaxLength(120)
	openingHours?: string;

	@IsOptional()
	@IsEnum(PlacePriceRange)
	priceRange?: PlacePriceRange;

	@IsOptional()
	@IsBoolean()
	hasStudentDiscount?: boolean;

	@IsOptional()
	@IsBoolean()
	isStudyFriendly?: boolean;

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(10)
	@IsUrl({}, { each: true })
	images?: string[];

	@IsUUID()
	categoryId!: string;

	@IsOptional()
	@IsBoolean()
	hasWifi?: boolean;

	@IsOptional()
	@IsBoolean()
	isOpen?: boolean;

	@IsOptional()
	@IsBoolean()
	isPetFriendly?: boolean;

	@IsOptional()
	@IsBoolean()
	isAccessible?: boolean;

	@IsOptional()
	@IsBoolean()
	isNightSpot?: boolean;
}

export class UpdatePlaceDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	name?: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(2000)
	description?: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(250)
	address?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-90)
	@Max(90)
	latitude?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-180)
	@Max(180)
	longitude?: number;

	@IsOptional()
	@IsString()
	@MaxLength(120)
	openingHours?: string;

	@IsOptional()
	@IsEnum(PlacePriceRange)
	priceRange?: PlacePriceRange;

	@IsOptional()
	@IsBoolean()
	hasStudentDiscount?: boolean;

	@IsOptional()
	@IsBoolean()
	isStudyFriendly?: boolean;

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(10)
	@IsUrl({}, { each: true })
	images?: string[];

	@IsOptional()
	@IsUUID()
	categoryId?: string;

	@IsOptional()
	@IsBoolean()
	hasWifi?: boolean;

	@IsOptional()
	@IsBoolean()
	isOpen?: boolean;

	@IsOptional()
	@IsBoolean()
	isPetFriendly?: boolean;

	@IsOptional()
	@IsBoolean()
	isAccessible?: boolean;

	@IsOptional()
	@IsBoolean()
	isNightSpot?: boolean;
}

export class PlacesQueryDto {
	@IsOptional()
	@IsString()
	@MaxLength(120)
	search?: string;

	@IsOptional()
	@IsUUID()
	categoryId?: string;

	@IsOptional()
	@IsEnum(PlacePriceRange)
	priceRange?: PlacePriceRange;

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