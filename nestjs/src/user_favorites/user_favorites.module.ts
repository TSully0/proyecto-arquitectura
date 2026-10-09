import { Module } from '@nestjs/common';
import { UserFavoritesController } from './user_favorites.controller.js';
import { UserFavoritesService } from './user_favorites.service.js';
import { user_favorites } from './entities/user_favorites.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports:[TypeOrmModule.forFeature([user_favorites])],
    controllers: [UserFavoritesController],
    providers: [UserFavoritesService]
})
export class UserFavoritesModule {}
