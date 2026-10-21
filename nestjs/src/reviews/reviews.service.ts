import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto, ReviewsQueryDto, UpdateReviewDto } from './dto/reviews.dto.js';
import { reviewsentity } from './entities/reviews.entity.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(reviewsentity)
    private readonly reviewRepository: Repository<reviewsentity>,
  ) {}

  async findAll(_query?: ReviewsQueryDto): Promise<reviewsentity[]> {
    return await this.reviewRepository.find({
      relations: { places: true, User: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<reviewsentity> {
    const review = await this.reviewRepository.findOne({
      where: { id: id.trim() },
      relations: { places: true, User: true },
    });
    if (!review) {
      throw new NotFoundException(`La reseña con ID "${id}" no existe`);
    }
    return review;
  }

  async create(dto: CreateReviewDto): Promise<reviewsentity> {
    try {
      const review = this.reviewRepository.create(dto);
      return await this.reviewRepository.save(review);
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'El lugar o usuario especificado no existe en la base de datos',
        );
      }
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe una reseña idéntica registrada');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateReviewDto): Promise<reviewsentity> {
    const review = await this.findOne(id);
    try {
      Object.assign(review, dto);
      return await this.reviewRepository.save(review);
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException('El recurso relacionado no existe');
      }
      if (error?.code === '23505') {
        throw new ConflictException('Conflicto al actualizar la reseña');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<reviewsentity> {
    const review = await this.findOne(id);
    try {
      await this.reviewRepository.remove(review);
      return review;
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'No se puede eliminar la reseña por dependencias activas',
        );
      }
      throw error;
    }
  }
}
