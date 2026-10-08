import { Module } from '@nestjs/common';
import { PlaceLikesController } from './place_likes.controller.js';
import { PlaceLikesService } from './place_likes.service.js';
import { place_likes } from './entities/place_likes.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([place_likes])],
    controllers: [PlaceLikesController],
    providers: [PlaceLikesService]
})
export class PlaceLikesModule {}
