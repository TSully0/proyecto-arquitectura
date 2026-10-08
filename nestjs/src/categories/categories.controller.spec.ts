import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: { findAll: ReturnType<typeof vi.fn>; findOne: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    categoriesService = { findAll: vi.fn(), findOne: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: categoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates category listing to its service', async () => {
    const categories = [{ id: 'category-id', name: 'Comida' }];
    categoriesService.findAll.mockResolvedValue(categories);

    await expect(controller.findAll()).resolves.toEqual(categories);
  });
});
