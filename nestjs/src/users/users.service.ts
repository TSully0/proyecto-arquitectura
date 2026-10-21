import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, UserEntity } from './entities/users.entity.js';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: id.trim() },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`El usuario con ID "${id}" no existe`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    try {
      const user = this.usersRepository.create({
        email: dto.email,
        fullName: dto.fullName,
        passwordHash: dto.password,
        role: dto.role || Role.STUDENT,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      });
      const saved = await this.usersRepository.save(user);
      return await this.findOne(saved.id);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe un usuario con este correo electrónico');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);
    try {
      if (dto.email !== undefined) user.email = dto.email;
      if (dto.fullName !== undefined) user.fullName = dto.fullName;
      if (dto.password !== undefined) user.passwordHash = dto.password;
      if (dto.role !== undefined) user.role = dto.role;
      if (dto.isActive !== undefined) user.isActive = dto.isActive;

      await this.usersRepository.save(user);
      return await this.findOne(id);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ya existe un usuario con este correo electrónico');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<UserEntity> {
    const user = await this.findOne(id);
    try {
      await this.usersRepository.remove(user);
      return user;
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(
          'No se puede eliminar el usuario debido a relaciones activas en el sistema',
        );
      }
      throw error;
    }
  }
}
