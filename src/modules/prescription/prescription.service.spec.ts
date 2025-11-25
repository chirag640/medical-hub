import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionService } from './prescription.service';
import { PrescriptionRepository } from './prescription.repository';
import { NotFoundException } from '@nestjs/common';

describe('PrescriptionService', () => {
  let service: PrescriptionService;
  let repository: jest.Mocked<PrescriptionRepository>;

  const mockPrescription = {
    _id: '507f1f77bcf86cd799439011',
    prescriptionDate: new Date(),
    medications: [{ test: 'data' }],
    instructions: 'test-instructions',
    duration: 'test-duration',
    refillsAllowed: 123,
    isFilled: true,
    pharmacyNotes: 'test-pharmacyNotes',
    patient: 'test-value',
    doctor: 'test-value',
    appointment: 'test-value',
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionService,
        {
          provide: PrescriptionRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PrescriptionService>(PrescriptionService);
    repository = module.get(PrescriptionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a prescription successfully', async () => {
      const createDto = {
        medications: [{ test: 'data' }],
        instructions: 'test-instructions',
        duration: 'test-duration',
        refillsAllowed: 123,
        isFilled: true,
        pharmacyNotes: 'test-pharmacyNotes',
        patient: 'test-value',
        doctor: 'test-value',
        appointment: 'test-value',
      };

      repository.create.mockResolvedValue(mockPrescription as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPrescription);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated prescriptions', async () => {
      const mockResult = {
        items: [mockPrescription],
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
    it('should return a prescription by id', async () => {
      repository.findById.mockResolvedValue(mockPrescription as any);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPrescription);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if prescription not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a prescription successfully', async () => {
      const updateDto = {};

      const updatedMock = { ...mockPrescription, ...updateDto };
      repository.findById.mockResolvedValue(mockPrescription as any);
      repository.update.mockResolvedValue(updatedMock as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedMock);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException if prescription not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a prescription successfully', async () => {
      repository.findById.mockResolvedValue(mockPrescription as any);
      // repository.remove.mockResolvedValue(undefined);

      await service.remove('507f1f77bcf86cd799439011');

      // expect(repository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if prescription not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
});
