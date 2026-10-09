import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user_favorites } from './entities/user_favorites.entity.js';

@Injectable()
export class UserFavoritesService {

    constructor(@InjectRepository(user_favorites) private readonly userfavorites: Repository<user_favorites>){}

    async findAll():Promise<user_favorites[]>{
        return await this.userfavorites.find();
    }
    async findOne(userId: string) :Promise<user_favorites>{
        const userfavo = await this.userfavorites.findOneBy({userId});
        if (!userfavo){throw new NotFoundException(`ñao ñao`)}
        return userfavo;
    }
}
