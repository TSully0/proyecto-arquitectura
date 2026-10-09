import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { reviewsentity } from './entities/reviews.entity.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
    imports:[TypeOrmModule.forFeature([reviewsentity])],
    controllers:[ReviewsController],
    providers:[ReviewsService]
})
export class ReviewsModule {}
