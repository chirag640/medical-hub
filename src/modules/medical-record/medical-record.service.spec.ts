import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordRepository } from './medical-record.repository';
import { NotFoundException } from '@nestjs/common';

describe('MedicalRecordService', () => {
  let service: MedicalRecordService;
  let repository: jest.Mocked<MedicalRecordRepository>;

  const mockMedicalRecord = {
    _id: '507f1f77bcf86cd799439011',
    recordDate: new Date(),
    recordType: 'Consultation',
    title: 'test-title',
    description: 'test-description',
    attachments: [{ test: 'data' }],
    isConfidential: true,
    vitalSigns: { test: 'data' },
    patient: 'test-value',
    doctor: 'test-value',
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
        MedicalRecordService,
        {
          provide: MedicalRecordRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MedicalRecordService>(MedicalRecordService);
    repository = module.get(MedicalRecordRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a medicalRecord successfully', async () => {
      const createDto = {
        recordType: 'Consultation',
        title: 'test-title',
        description: 'test-description',
        attachments: [{ test: 'data' }],
        isConfidential: true,
        vitalSigns: { test: 'data' },
        patient: 'test-value',
        doctor: 'test-value',
      };

      repository.create.mockResolvedValue(mockMedicalRecord as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockMedicalRecord);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated medicalrecords', async () => {
      const mockResult = {
        items: [mockMedicalRecord],
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
    it('should return a medicalRecord by id', async () => {
      repository.findById.mockResolvedValue(mockMedicalRecord as any);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockMedicalRecord);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if medicalRecord not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a medicalRecord successfully', async () => {
      const updateDto = {};

      const updatedMock = { ...mockMedicalRecord, ...updateDto };
      repository.findById.mockResolvedValue(mockMedicalRecord as any);
      repository.update.mockResolvedValue(updatedMock as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedMock);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException if medicalRecord not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a medicalRecord successfully', async () => {
      repository.findById.mockResolvedValue(mockMedicalRecord as any);
      // repository.remove.mockResolvedValue(undefined);

      await service.remove('507f1f77bcf86cd799439011');

      // expect(repository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if medicalRecord not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
});
