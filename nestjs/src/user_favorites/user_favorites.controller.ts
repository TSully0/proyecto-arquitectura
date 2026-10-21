import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserFavoriteDto, UpdateUserFavoriteDto } from './dto/user_favorites.dto.js';
import { user_favorites } from './entities/user_favorites.entity.js';
import { UserFavoritesService } from './user_favorites.service.js';

@Controller('user-favorites')
export class UserFavoritesController {
  constructor(private readonly userFavoritesService: UserFavoritesService) {}

  @Get()
  async findAll(): Promise<user_favorites[]> {
    return await this.userFavoritesService.findAll();
  }

  @Get(':userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<user_favorites[]> {
    return await this.userFavoritesService.findByUser(userId);
  }

  @Get(':userId/:placeId')
  async findOne(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('placeId', ParseUUIDPipe) placeId: string,
  ): Promise<user_favorites> {
    return await this.userFavoritesService.findOne(userId, placeId);
  }

  @Post()
  async create(
    @Body() createUserFavoriteDto: CreateUserFavoriteDto,
  ): Promise<user_favorites> {
    return await this.userFavoritesService.create(createUserFavoriteDto);
  }

  @Patch(':userId/:placeId')
  async update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() updateUserFavoriteDto: UpdateUserFavoriteDto,
  ): Promise<user_favorites> {
    return await this.userFavoritesService.update(userId, placeId, updateUserFavoriteDto);
  }

  @Delete(':userId/:placeId')
  async remove(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('placeId', ParseUUIDPipe) placeId: string,
  ): Promise<user_favorites> {
    return await this.userFavoritesService.remove(userId, placeId);
  }

  @Delete(':userId')
  async removeFirst(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<user_favorites> {
    return await this.userFavoritesService.remove(userId);
  }
}
