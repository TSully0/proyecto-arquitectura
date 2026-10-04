import { IsUUID } from 'class-validator';

export class CreatePlaceLikeDto {
	@IsUUID()
	placeId!: string;
}