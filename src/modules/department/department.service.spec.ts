import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repository: jest.Mocked<DepartmentRepository>;

  const mockDepartment = {
    _id: '507f1f77bcf86cd799439011',
    name: 'test-name',
    description: 'test-description',
    location: 'test-location',
    phone: 'test-phone',
    budget: 123,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: DepartmentRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    repository = module.get(DepartmentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a department successfully', async () => {
      const createDto = {
        name: 'test-name',
        description: 'test-description',
        location: 'test-location',
        phone: 'test-phone',
        budget: 123,
      };

      repository.create.mockResolvedValue(mockDepartment as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDepartment);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException if name already exists', async () => {
      const createDto = {
        name: 'test-name',
        description: 'test-description',
        location: 'test-location',
        phone: 'test-phone',
        budget: 123,
      };

      repository.findByName.mockResolvedValue(mockDepartment as any);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findByName).toHaveBeenCalledWith(createDto.name);
    });
  });

  describe('findAll', () => {
    it('should return paginated departments', async () => {
      const mockResult = {
        items: [mockDepartment],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      repository.findAll.mockResolvedValue(mockResult as any);

      const result = await service.findAll(1, 10);

      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      repository.findById.mockResolvedValue(mockDepartment as any);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockDepartment);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a department successfully', async () => {
      const updateDto = {};

      const updatedMock = { ...mockDepartment, ...updateDto };
      repository.findById.mockResolvedValue(mockDepartment as any);
      repository.update.mockResolvedValue(updatedMock as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedMock);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a department successfully', async () => {
      repository.findById.mockResolvedValue(mockDepartment as any);
      // repository.remove.mockResolvedValue(undefined);

      await service.remove('507f1f77bcf86cd799439011');

      // expect(repository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
});
