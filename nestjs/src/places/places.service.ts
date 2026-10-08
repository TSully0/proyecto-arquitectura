import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { places } from './entities/places.entity.js';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(places)
    private readonly placesRepository: Repository<places>,
  ) {}

  async findAll(): Promise<places[]> {
    return await this.placesRepository.find();
  }

  async findOne(id: string): Promise<places> {
    const place = await this.placesRepository.findOneBy({id: id.trim()});
    if (!place) {
      throw new NotFoundException(`Lugar con ID "${id}" no encontrado`);
    }
    return place;
  }
}