import { Injectable, NotFoundException } from '@nestjs/common';
import { categories } from './entities/categories.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
    constructor (@InjectRepository(categories) private readonly categorieRepo:Repository<categories>){}
    async findAll(): Promise<categories[]>{
        return await this.categorieRepo.find();
    }
    async findOne(id: string): Promise<categories>{
        const categorie = await this.categorieRepo.findOneBy({id: id.trim()})
        if  (!categorie) {throw new NotFoundException(`Esta categoria no existe`)}
        return categorie;
    }
}
