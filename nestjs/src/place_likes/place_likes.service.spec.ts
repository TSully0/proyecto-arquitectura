import { Test, TestingModule } from '@nestjs/testing';
import { PlaceLikesService } from './place_likes.service';

describe('PlaceLikesService', () => {
  let service: PlaceLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceLikesService],
    }).compile();

    service = module.get<PlaceLikesService>(PlaceLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
