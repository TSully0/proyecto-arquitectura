import { Controller,Get,Post,Param,Patch,ParseUUIDPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly review:ReviewsService){}

    @Get()
    findAll(){
        return this.review.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.review.findOne(id);
    }
}
