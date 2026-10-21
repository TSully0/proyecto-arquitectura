import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlaceLikeDto, UpdatePlaceLikeDto } from './dto/place_likes.dto.js';
import { place_likes } from './entities/place_likes.entity.js';

@Injectable()
export class PlaceLikesService {
  constructor(
    @InjectRepository(place_likes)
    private readonly placeLikeRepository: Repository<place_likes>,
  ) {}

  async findAll(): Promise<place_likes[]> {
    return await this.placeLikeRepository.find({
      relations: { places: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<place_likes> {
    const like = await this.placeLikeRepository.findOne({
      where: { id: id.trim() },
      relations: { places: true },
    });
    if (!like) {
      throw new NotFoundException(`El like con ID "${id}" no existe`);
    }
    return like;
  }

  async create(dto: CreatePlaceLikeDto): Promise<place_likes> {
    try {
      const like = this.placeLikeRepository.create(dto);
      return await this.placeLikeRepository.save(like);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Este cliente ya ha dado me gusta a este lugar');
      }
      if (error?.code === '23503') {
        throw new ConflictException('El lugar referenciado no existe');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePlaceLikeDto): Promise<place_likes> {
    const like = await this.findOne(id);
    try {
      Object.assign(like, dto);
      return await this.placeLikeRepository.save(like);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe un me gusta registrado con estos datos');
      }
      if (error?.code === '23503') {
        throw new ConflictException('El lugar referenciado no existe');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<place_likes> {
    const like = await this.findOne(id);
    try {
      await this.placeLikeRepository.remove(like);
      return like;
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException('No se puede eliminar el like por relaciones asociadas');
      }
      throw error;
    }
  }
}
