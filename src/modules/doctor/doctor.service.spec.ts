import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from './doctor.service';
import { DoctorRepository } from './doctor.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DoctorService', () => {
  let service: DoctorService;
  let repository: jest.Mocked<DoctorRepository>;

  const mockDoctor = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test-email',
    firstName: 'test-firstName',
    lastName: 'test-lastName',
    phone: 'test-phone',
    specialization: 'Cardiology',
    licenseNumber: 'test-licenseNumber',
    yearsOfExperience: 123,
    salary: 123,
    workSchedule: { test: 'data' },
    isActive: true,
    department: 'test-value',
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
      findByEmail: jest.fn(),
      findByLicensenumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: DoctorRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    repository = module.get(DoctorRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a doctor successfully', async () => {
      const createDto = {
        email: 'test-email',
        firstName: 'test-firstName',
        lastName: 'test-lastName',
        phone: 'test-phone',
        specialization: 'Cardiology',
        licenseNumber: 'test-licenseNumber',
        yearsOfExperience: 123,
        salary: 123,
        workSchedule: { test: 'data' },
        department: 'test-value',
      };

      repository.create.mockResolvedValue(mockDoctor as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDoctor);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto = {
        email: 'test-email',
        firstName: 'test-firstName',
        lastName: 'test-lastName',
        phone: 'test-phone',
        specialization: 'Cardiology',
        licenseNumber: 'test-licenseNumber',
        yearsOfExperience: 123,
        salary: 123,
        workSchedule: { test: 'data' },
        department: 'test-value',
      };

      repository.findByEmail.mockResolvedValue(mockDoctor as any);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findByEmail).toHaveBeenCalledWith(createDto.email);
    });
    it('should throw ConflictException if licenseNumber already exists', async () => {
      const createDto = {
        email: 'test-email',
        firstName: 'test-firstName',
        lastName: 'test-lastName',
        phone: 'test-phone',
        specialization: 'Cardiology',
        licenseNumber: 'test-licenseNumber',
        yearsOfExperience: 123,
        salary: 123,
        workSchedule: { test: 'data' },
        department: 'test-value',
      };

      repository.findByLicensenumber.mockResolvedValue(mockDoctor as any);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findByLicensenumber).toHaveBeenCalledWith(createDto.licenseNumber);
    });
  });

  describe('findAll', () => {
    it('should return paginated doctors', async () => {
      const mockResult = {
        items: [mockDoctor],
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
    it('should return a doctor by id', async () => {
      repository.findById.mockResolvedValue(mockDoctor as any);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockDoctor);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if doctor not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a doctor successfully', async () => {
      const updateDto = {};

      const updatedMock = { ...mockDoctor, ...updateDto };
      repository.findById.mockResolvedValue(mockDoctor as any);
      repository.update.mockResolvedValue(updatedMock as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedMock);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException if doctor not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a doctor successfully', async () => {
      repository.findById.mockResolvedValue(mockDoctor as any);
      // repository.remove.mockResolvedValue(undefined);

      await service.remove('507f1f77bcf86cd799439011');

      // expect(repository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if doctor not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
});
