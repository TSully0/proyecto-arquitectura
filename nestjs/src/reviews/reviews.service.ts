import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsQueryDto } from './dto/reviews.dto.js';
import { reviewsentity } from './entities/reviews.entity.js';

@Injectable()
export class ReviewsService {
    constructor(@InjectRepository(reviewsentity) private readonly review: Repository<reviewsentity>){}

    async findAll(): Promise<reviewsentity[]>{
        return await this.review.find();
    }

    async findOne(id:string): Promise<reviewsentity>{
        const revie= await this.review.findOneBy({id: id.trim()});
        if (!revie) {throw new NotFoundException('ñoñoño')}
        return revie;
    }

    async create(dto:ReviewsQueryDto): Promise<reviewsentity>{
        const review = this.review.create(dto);
        return await this.review.save(review);
    }

    async update (id: string, dto:ReviewsQueryDto){
        const revie = await this.findOne(id);
        Object.assign(revie,dto);
        return await this.review.save(revie);
    }
}
