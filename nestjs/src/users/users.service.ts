import { Injectable, NotFoundException } from '@nestjs/common';
import {users} from './entities/users.entity.js'
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(users) private readonly users: Repository<users>){}
    findAll (id?: number){
        return this.users.find({where: id? {id}: {} });

    }
    async findOne(id: number): Promise<users>{
        const users=await this.users.findOneBy({id: Number(id)});
        if (!users) throw new NotFoundException(`No existe este id`)
        return users;
    }
}
