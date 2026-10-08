import { Controller,Get, Post,Patch,Param, ParseUUIDPipe } from '@nestjs/common';
import { PlaceLikesService } from './place_likes.service.js';
@Controller('place-likes')
export class PlaceLikesController{
    constructor (private readonly placelike:PlaceLikesService){}

    @Get()
    findAll(){
        return this.placelike.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id:string){
        return this.placelike.findOne(id);
    }
}
