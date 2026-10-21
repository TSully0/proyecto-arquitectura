import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePlaceLikeDto {
  @IsUUID()
  placeId!: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;
}

export class UpdatePlaceLikeDto {
  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientId?: string;
}