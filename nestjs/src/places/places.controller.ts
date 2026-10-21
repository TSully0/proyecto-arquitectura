import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePlaceDto, PlacesQueryDto, UpdatePlaceDto } from './dto/places.dto.js';
import { places } from './entities/places.entity.js';
import { PlacesService } from './places.service.js';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async findAll(@Query() query?: PlacesQueryDto): Promise<places[]> {
    return await this.placesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<places> {
    return await this.placesService.findOne(id);
  }

  @Post()
  async create(@Body() createPlaceDto: CreatePlaceDto): Promise<places> {
    return await this.placesService.create(createPlaceDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ): Promise<places> {
    return await this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<places> {
    return await this.placesService.remove(id);
  }
}
