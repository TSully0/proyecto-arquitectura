import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/categories.entity.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const categoryRepository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(CategoryEntity), useValue: categoryRepository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns categories in display order', async () => {
    const categories = [{ id: 'category-id', name: 'Comida' }];
    categoryRepository.find.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toEqual(categories);
    expect(categoryRepository.find).toHaveBeenCalledWith({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  });
});
