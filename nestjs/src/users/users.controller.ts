import { Controller, ParseIntPipe,Get,Param } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
    constructor(private readonly UsersService: UsersService){}

    @Get()
    findAll(){
        return this.UsersService.findAll();
    }
    @Get(':id')
    findOne(@Param('id',ParseIntPipe) id:number){
        return this.UsersService.findOne(id);
    }
}
