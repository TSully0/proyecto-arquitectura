import { IsOptional, IsUUID } from 'class-validator';

export class CreateUserFavoriteDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  placeId!: string;
}

export class UpdateUserFavoriteDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  placeId?: string;
}