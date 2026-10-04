import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { categories } from './entities/categories.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports:[TypeOrmModule.forFeature([categories])],
    controllers: [CategoriesController],
    providers: [CategoriesService]
})
export class CategoriesModule {}
