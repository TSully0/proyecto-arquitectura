import { Test, TestingModule } from '@nestjs/testing';
import { PlaceLikesController } from './place_likes.controller';

describe('PlaceLikesController', () => {
  let controller: PlaceLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceLikesController],
    }).compile();

    controller = module.get<PlaceLikesController>(PlaceLikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
