import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';
import { NotFoundException } from '@nestjs/common';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repository: jest.Mocked<AppointmentRepository>;

  const mockAppointment = {
    _id: '507f1f77bcf86cd799439011',
    appointmentDate: new Date(),
    duration: 123,
    reason: 'test-reason',
    status: 'Scheduled',
    notes: 'test-notes',
    diagnosis: 'test-diagnosis',
    prescription: { test: 'data' },
    fee: 123,
    isPaid: true,
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
        AppointmentService,
        {
          provide: AppointmentRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    repository = module.get(AppointmentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a appointment successfully', async () => {
      const createDto = {
        appointmentDate: new Date(),
        duration: 123,
        reason: 'test-reason',
        notes: 'test-notes',
        diagnosis: 'test-diagnosis',
        prescription: { test: 'data' },
        fee: 123,
        isPaid: true,
        patient: 'test-value',
        doctor: 'test-value',
      };

      repository.create.mockResolvedValue(mockAppointment as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAppointment);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated appointments', async () => {
      const mockResult = {
        items: [mockAppointment],
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
    it('should return a appointment by id', async () => {
      repository.findById.mockResolvedValue(mockAppointment as any);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockAppointment);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if appointment not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a appointment successfully', async () => {
      const updateDto = {};

      const updatedMock = { ...mockAppointment, ...updateDto };
      repository.findById.mockResolvedValue(mockAppointment as any);
      repository.update.mockResolvedValue(updatedMock as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedMock);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException if appointment not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a appointment successfully', async () => {
      repository.findById.mockResolvedValue(mockAppointment as any);
      // repository.remove.mockResolvedValue(undefined);

      await service.remove('507f1f77bcf86cd799439011');

      // expect(repository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if appointment not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
});
