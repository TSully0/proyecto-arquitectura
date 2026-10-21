import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlaceDto, PlacesQueryDto, UpdatePlaceDto } from './dto/places.dto.js';
import { places } from './entities/places.entity.js';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(places)
    private readonly placesRepository: Repository<places>,
  ) {}

  async findAll(_query?: PlacesQueryDto): Promise<places[]> {
    return await this.placesRepository.find({
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<places> {
    const place = await this.placesRepository.findOne({
      where: { id: id.trim() },
      relations: { category: true },
    });
    if (!place) {
      throw new NotFoundException(`Lugar con ID "${id}" no encontrado`);
    }
    return place;
  }

  async create(dto: CreatePlaceDto): Promise<places> {
    try {
      const place = this.placesRepository.create(dto);
      const saved = await this.placesRepository.save(place);
      return await this.findOne(saved.id);
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'La categoría o autor especificado no existe en la base de datos',
        );
      }
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe un lugar con esos datos');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<places> {
    const place = await this.findOne(id);
    try {
      Object.assign(place, dto);
      await this.placesRepository.save(place);
      return await this.findOne(id);
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'La categoría o autor especificado no existe en la base de datos',
        );
      }
      if (error?.code === '23505') {
        throw new ConflictException('Conflicto al actualizar el lugar');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<places> {
    const place = await this.findOne(id);
    try {
      await this.placesRepository.remove(place);
      return place;
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'No se puede eliminar el lugar porque contiene relaciones asociadas',
        );
      }
      throw error;
    }
  }
}