import { Controller,Get,Post,Param,Patch,ParseUUIDPipe, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/reviews.dto.js';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly review:ReviewsService){}

    @Get()
    async findAll(){
        return await this.review.findAll()
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string){
        return await this.review.findOne(id);
    }

    @Post()
    async create(@Body()createreviw: CreateReviewDto){
        return await this.review.create(createreviw);
    }

    @Patch(':id')
    async update(@Param('id') id:string, @Body() bod:CreateReviewDto){
        return await this.review.update(String(id),bod);
    }
}
