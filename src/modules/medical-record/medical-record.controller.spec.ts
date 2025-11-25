import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordService } from './medical-record.service';

describe('MedicalRecordController', () => {
  let controller: MedicalRecordController;
  let service: jest.Mocked<MedicalRecordService>;

  const mockMedicalRecord = {
    _id: '507f1f77bcf86cd799439011',
    recordDate: 'test-value',
    recordType: 'test-value',
    title: 'test-title',
    description: 'test-description',
    attachments: 'test-value',
    isConfidential: true,
    vitalSigns: 'test-value',
    patient: 'test-value',
    doctor: 'test-value',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordController],
      providers: [
        {
          provide: MedicalRecordService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MedicalRecordController>(MedicalRecordController);
    service = module.get(MedicalRecordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a medicalRecord', async () => {
      const createDto = {
        recordType: 'test-value',
        title: 'test-title',
        description: 'test-description',
        attachments: 'test-value',
        isConfidential: true,
        vitalSigns: 'test-value',
        patient: 'test-value',
        doctor: 'test-value',
      };

      service.create.mockResolvedValue(mockMedicalRecord as any);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockMedicalRecord);
      expect(service.create).toHaveBeenCalledWith(createDto);
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

      service.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a medicalRecord by id', async () => {
      service.findOne.mockResolvedValue(mockMedicalRecord as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockMedicalRecord);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update a medicalRecord', async () => {
      const updateDto = {};

      const updatedMock = { ...mockMedicalRecord, ...updateDto };
      service.update.mockResolvedValue(updatedMock as any);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto as any);

      expect(result).toEqual(updatedMock);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a medicalRecord', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('507f1f77bcf86cd799439011');

      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
