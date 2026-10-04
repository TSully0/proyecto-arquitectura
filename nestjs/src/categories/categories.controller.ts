import { Controller,ParseUUIDPipe,Get,Param} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
@Controller('categories')
export class CategoriesController {
    constructor (private readonly CategoriesService:CategoriesService){}

    @Get()
    findAll(){
        return this.CategoriesService.findAll();
    }
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id:string){
        return this.CategoriesService.findOne(id);
    }
}
