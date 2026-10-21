import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserFavoriteDto, UpdateUserFavoriteDto } from './dto/user_favorites.dto.js';
import { user_favorites } from './entities/user_favorites.entity.js';

@Injectable()
export class UserFavoritesService {
  constructor(
    @InjectRepository(user_favorites)
    private readonly userFavoritesRepository: Repository<user_favorites>,
  ) {}

  async findAll(): Promise<user_favorites[]> {
    return await this.userFavoritesRepository.find({
      relations: { places: true, UserEntity: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<user_favorites[]> {
    return await this.userFavoritesRepository.find({
      where: { userId: userId.trim() },
      relations: { places: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, placeId?: string): Promise<user_favorites> {
    const whereCondition = placeId
      ? { userId: userId.trim(), placeId: placeId.trim() }
      : { userId: userId.trim() };

    const favorite = await this.userFavoritesRepository.findOne({
      where: whereCondition,
      relations: { places: true, UserEntity: true },
    });

    if (!favorite) {
      throw new NotFoundException(
        `Favorito no encontrado para el usuario "${userId}"${placeId ? ` y lugar "${placeId}"` : ''}`,
      );
    }
    return favorite;
  }

  async create(dto: CreateUserFavoriteDto): Promise<user_favorites> {
    const existing = await this.userFavoritesRepository.findOne({
      where: { userId: dto.userId.trim(), placeId: dto.placeId.trim() },
    });
    if (existing) {
      throw new ConflictException(
        'Este lugar ya se encuentra en los favoritos del usuario',
      );
    }

    try {
      const favorite = this.userFavoritesRepository.create({
        userId: dto.userId.trim(),
        placeId: dto.placeId.trim(),
      });
      await this.userFavoritesRepository.insert(favorite);
      return await this.findOne(dto.userId, dto.placeId);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          'Este lugar ya se encuentra en los favoritos del usuario',
        );
      }
      if (error?.code === '23503') {
        throw new ConflictException(
          'El usuario o lugar especificado no existe en el sistema',
        );
      }
      throw error;
    }
  }

  async update(
    userId: string,
    placeId: string,
    dto: UpdateUserFavoriteDto,
  ): Promise<user_favorites> {
    const favorite = await this.findOne(userId, placeId);
    try {
      if (dto.placeId && dto.placeId !== placeId) {
        await this.userFavoritesRepository.remove(favorite);
        const newFav = this.userFavoritesRepository.create({
          userId,
          placeId: dto.placeId,
        });
        await this.userFavoritesRepository.insert(newFav);
        return await this.findOne(userId, dto.placeId);
      }
      return favorite;
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe ese registro en los favoritos del usuario');
      }
      if (error?.code === '23503') {
        throw new ConflictException('El lugar o usuario referenciado no existe');
      }
      throw error;
    }
  }

  async remove(userId: string, placeId?: string): Promise<user_favorites> {
    const favorite = await this.findOne(userId, placeId);
    try {
      await this.userFavoritesRepository.remove(favorite);
      return favorite;
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException('No se puede eliminar el favorito por dependencias activas');
      }
      throw error;
    }
  }
}
