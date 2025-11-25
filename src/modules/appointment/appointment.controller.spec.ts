import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: jest.Mocked<AppointmentService>;

  const mockAppointment = {
    _id: '507f1f77bcf86cd799439011',
    appointmentDate: 'test-value',
    duration: 123,
    reason: 'test-reason',
    status: 'test-value',
    notes: 'test-notes',
    diagnosis: 'test-diagnosis',
    prescription: 'test-value',
    fee: 123,
    isPaid: true,
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
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get(AppointmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a appointment', async () => {
      const createDto = {
        appointmentDate: 'test-value',
        duration: 123,
        reason: 'test-reason',
        notes: 'test-notes',
        diagnosis: 'test-diagnosis',
        prescription: 'test-value',
        fee: 123,
        isPaid: true,
        patient: 'test-value',
        doctor: 'test-value',
      };

      service.create.mockResolvedValue(mockAppointment as any);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockAppointment);
      expect(service.create).toHaveBeenCalledWith(createDto);
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

      service.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a appointment by id', async () => {
      service.findOne.mockResolvedValue(mockAppointment as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockAppointment);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update a appointment', async () => {
      const updateDto = {};

      const updatedMock = { ...mockAppointment, ...updateDto };
      service.update.mockResolvedValue(updatedMock as any);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto as any);

      expect(result).toEqual(updatedMock);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a appointment', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('507f1f77bcf86cd799439011');

      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
