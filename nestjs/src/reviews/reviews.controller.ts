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
import { CreateReviewDto, ReviewsQueryDto, UpdateReviewDto } from './dto/reviews.dto.js';
import { reviewsentity } from './entities/reviews.entity.js';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(@Query() query?: ReviewsQueryDto): Promise<reviewsentity[]> {
    return await this.reviewsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<reviewsentity> {
    return await this.reviewsService.findOne(id);
  }

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto): Promise<reviewsentity> {
    return await this.reviewsService.create(createReviewDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<reviewsentity> {
    return await this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<reviewsentity> {
    return await this.reviewsService.remove(id);
  }
}
