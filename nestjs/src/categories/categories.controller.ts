import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CategoryEntity } from './entities/categories.entity.js';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<CategoryEntity[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryEntity> {
    return this.categoriesService.findOne(id);
  }
}
