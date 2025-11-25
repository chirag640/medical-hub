import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';

describe('PrescriptionController', () => {
  let controller: PrescriptionController;
  let service: jest.Mocked<PrescriptionService>;

  const mockPrescription = {
    _id: '507f1f77bcf86cd799439011',
    prescriptionDate: 'test-value',
    medications: 'test-value',
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
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionController],
      providers: [
        {
          provide: PrescriptionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PrescriptionController>(PrescriptionController);
    service = module.get(PrescriptionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a prescription', async () => {
      const createDto = {
        medications: 'test-value',
        instructions: 'test-instructions',
        duration: 'test-duration',
        refillsAllowed: 123,
        isFilled: true,
        pharmacyNotes: 'test-pharmacyNotes',
        patient: 'test-value',
        doctor: 'test-value',
        appointment: 'test-value',
      };

      service.create.mockResolvedValue(mockPrescription as any);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockPrescription);
      expect(service.create).toHaveBeenCalledWith(createDto);
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

      service.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a prescription by id', async () => {
      service.findOne.mockResolvedValue(mockPrescription as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPrescription);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update a prescription', async () => {
      const updateDto = {};

      const updatedMock = { ...mockPrescription, ...updateDto };
      service.update.mockResolvedValue(updatedMock as any);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto as any);

      expect(result).toEqual(updatedMock);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a prescription', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('507f1f77bcf86cd799439011');

      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
