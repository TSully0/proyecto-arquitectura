import { Controller,Get, Param, Post,Patch, ParseUUIDPipe } from '@nestjs/common';
import { PlacesService } from './places.service.js';


@Controller('places')
export class PlacesController {
    constructor (private readonly place:PlacesService){}

    @Get()
    findAll(){
        return this.place.findAll();
    }
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id:string ){
        return this.place.findOne(id);
    }


}
