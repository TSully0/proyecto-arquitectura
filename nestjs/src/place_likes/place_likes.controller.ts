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
import { CreatePlaceLikeDto, UpdatePlaceLikeDto } from './dto/place_likes.dto.js';
import { place_likes } from './entities/place_likes.entity.js';
import { PlaceLikesService } from './place_likes.service.js';

@Controller('place-likes')
export class PlaceLikesController {
  constructor(private readonly placeLikesService: PlaceLikesService) {}

  @Get()
  async findAll(): Promise<place_likes[]> {
    return await this.placeLikesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<place_likes> {
    return await this.placeLikesService.findOne(id);
  }

  @Post()
  async create(@Body() createPlaceLikeDto: CreatePlaceLikeDto): Promise<place_likes> {
    return await this.placeLikesService.create(createPlaceLikeDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlaceLikeDto: UpdatePlaceLikeDto,
  ): Promise<place_likes> {
    return await this.placeLikesService.update(id, updatePlaceLikeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<place_likes> {
    return await this.placeLikesService.remove(id);
  }
}
