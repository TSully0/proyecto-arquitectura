import { IsUUID } from 'class-validator';

export class CreateUserFavoriteDto {
	@IsUUID()
	placeId!: string;
}