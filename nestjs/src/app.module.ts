import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { UserFavoritesModule } from './user_favorites/user_favorites.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { PlaceLikesModule } from './place_likes/place_likes.module.js';
import { PlacesModule } from './places/places.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    UserFavoritesModule,
    ReviewsModule,
    PlaceLikesModule,
    PlacesModule,
    CategoriesModule,
    ConfigModule.forRoot({ isGlobal: true }),
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
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
