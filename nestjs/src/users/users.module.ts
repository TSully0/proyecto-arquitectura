import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import {users} from './entities/users.entity.js'
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([users])],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
