import { Injectable, NotFoundException } from '@nestjs/common';
import {users} from './entities/users.entity.js'
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(users) private readonly usersRepo: Repository<users>){}
    async findAll (): Promise<users[]>{
        return await this.usersRepo.find();
    }
    async findOne(id: string): Promise<users>{
        const users=await this.usersRepo.findOneBy({id: id.trim()});
        if (!users) {throw new NotFoundException(`No existe este id`)}
        return users;
    }
}
