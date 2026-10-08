import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { UserFavoritesController } from './user_favorites/user_favorites.controller.js';
import { UserFavoritesService } from './user_favorites/user_favorites.service.js';
import { UserFavoritesModule } from './user_favorites/user_favorites.module.js';
import { ReviewsController } from './reviews/reviews.controller.js';
import { ReviewsService } from './reviews/reviews.service.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { PlaceLikesController } from './place_likes/place_likes.controller.js';
import { PlaceLikesService } from './place_likes/place_likes.service.js';
import { PlaceLikesModule } from './place_likes/place_likes.module.js';
import { PlacesController } from './places/places.controller.js';
import { PlacesService } from './places/places.service.js';
import { PlacesModule } from './places/places.module.js';
import { CategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { CategoriesModule } from './categories/categories.module.js';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
  imports: [UsersModule, UserFavoritesModule, ReviewsModule, PlaceLikesModule, PlacesModule, CategoriesModule,
    ConfigModule.forRoot({isGlobal: true,}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, 
        ssl: {
          rejectUnauthorized: false, 
        },
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
