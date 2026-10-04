import { Controller, ParseUUIDPipe,Get,Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { version } from 'os';

@Controller('users')
export class UsersController {
    constructor(private readonly UsersService: UsersService){}

    @Get()
    findAll(){
        return this.UsersService.findAll();
    }
    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({version:'all'})) id:string){
        return this.UsersService.findOne(id);
    }
}
