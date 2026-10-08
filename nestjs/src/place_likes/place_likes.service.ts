import { Injectable, NotFoundException } from '@nestjs/common';
import {place_likes} from './entities/place_likes.entity.js'
import { Repository } from 'typeorm';
import { InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class PlaceLikesService {
    constructor (@InjectRepository(place_likes) private readonly place_like:Repository<place_likes>){}

    async findAll(): Promise<place_likes[]>{
        return await this.place_like.find();
    }

    async findOne(id: string): Promise<place_likes>{
        const place_li = await this.place_like.findOneBy({id: id.trim()});
        if(!place_li) {throw new NotFoundException(`no existen registros`)}
        return place_li;
    }
    
}
