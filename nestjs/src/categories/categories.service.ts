import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto.js';
import { CategoryEntity } from './entities/categories.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoriesRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOneBy({ id: id.trim() });
    if (!category) {
      throw new NotFoundException(`La categoría con ID "${id}" no existe`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    try {
      const category = this.categoriesRepository.create(dto);
      return await this.categoriesRepository.save(category);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe una categoría con ese nombre o slug');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    try {
      Object.assign(category, dto);
      return await this.categoriesRepository.save(category);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe una categoría con ese nombre o slug');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    try {
      await this.categoriesRepository.remove(category);
      return category;
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'No se puede eliminar la categoría porque tiene lugares asociados',
        );
      }
      throw error;
    }
  }
}
