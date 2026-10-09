import { Controller,Get,Post,Patch,Param, ParseUUIDPipe } from '@nestjs/common';
import { UserFavoritesService } from './user_favorites.service.js';
import { user_favorites } from './entities/user_favorites.entity.js';

@Controller('user-favorites')
export class UserFavoritesController {
    constructor (private readonly userfavorite: UserFavoritesService){}
    @Get()
    findAll(){
        return this.userfavorite.findAll();
    }
    @Get(':userId')
    findOne(@Param('userId', ParseUUIDPipe) userId:string): Promise<user_favorites>{
        return this.userfavorite.findOne(userId);
    }
}
