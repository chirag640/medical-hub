import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentOutputDto } from './dto/appointment-output.dto';
import { PaginatedResponse, createPaginatedResponse } from '../../pagination.dto';

@Injectable()
export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async create(dto: CreateAppointmentDto, createdBy?: string): Promise<AppointmentOutputDto> {
    const appointmentData: any = { ...dto };
    if (createdBy) {
      appointmentData.createdBy = createdBy;
    }
    const created = await this.appointmentRepository.create(appointmentData);
    return this.mapToOutput(created);
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<AppointmentOutputDto>> {
    // Pagination defaults: page 1, limit 10, max 100
    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      this.appointmentRepository.findAll(skip, itemsPerPage),
      this.appointmentRepository.count(),
    ]);

    const data = items.map((item) => this.mapToOutput(item));
    return createPaginatedResponse(data, total, currentPage, itemsPerPage);
  }

  async findOne(id: string): Promise<AppointmentOutputDto> {
    const item = await this.appointmentRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return this.mapToOutput(item);
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    lastModifiedBy?: string,
  ): Promise<AppointmentOutputDto> {
    const updateData: any = { ...dto };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    const updated = await this.appointmentRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return this.mapToOutput(updated);
  }

  async remove(id: string, deletedBy?: string): Promise<void> {
    // Soft delete with audit trail
    const updated = await this.appointmentRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    });
    if (!updated) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  private mapToOutput(item: any): AppointmentOutputDto {
    return {
      id: item._id?.toString() || item.id,
      appointmentDate: item.appointmentDate,
      duration: item.duration,
      reason: item.reason,
      status: item.status,
      notes: item.notes,
      diagnosis: item.diagnosis,
      prescription: item.prescription,
      fee: item.fee,
      isPaid: item.isPaid,
      patient: item.patient,
      doctor: item.doctor,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
