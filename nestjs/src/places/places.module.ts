import { Module } from '@nestjs/common';
import  {PlacesService} from './places.service.js'
import { PlacesController } from './places.controller.js';
import { places } from './entities/places.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([places])],
    controllers: [PlacesController],
    providers: [PlacesService]
})
export class PlacesModule {}
