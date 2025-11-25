import { Injectable, NotFoundException } from '@nestjs/common';
import { PrescriptionRepository } from './prescription.repository';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionOutputDto } from './dto/prescription-output.dto';
import { PaginatedResponse, createPaginatedResponse } from '../../pagination.dto';

@Injectable()
export class PrescriptionService {
  constructor(private readonly prescriptionRepository: PrescriptionRepository) {}

  async create(dto: CreatePrescriptionDto): Promise<PrescriptionOutputDto> {
    const created = await this.prescriptionRepository.create(dto);
    return this.mapToOutput(created);
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<PrescriptionOutputDto>> {
    // Pagination defaults: page 1, limit 10, max 100
    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      this.prescriptionRepository.findAll(skip, itemsPerPage),
      this.prescriptionRepository.count(),
    ]);

    const data = items.map((item) => this.mapToOutput(item));
    return createPaginatedResponse(data, total, currentPage, itemsPerPage);
  }

  async findOne(id: string): Promise<PrescriptionOutputDto> {
    const item = await this.prescriptionRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return this.mapToOutput(item);
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<PrescriptionOutputDto> {
    const updated = await this.prescriptionRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return this.mapToOutput(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.prescriptionRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
  }

  private mapToOutput(item: any): PrescriptionOutputDto {
    return {
      id: item._id?.toString() || item.id,
      prescriptionDate: item.prescriptionDate,
      medications: item.medications,
      instructions: item.instructions,
      duration: item.duration,
      refillsAllowed: item.refillsAllowed,
      isFilled: item.isFilled,
      pharmacyNotes: item.pharmacyNotes,
      patient: item.patient,
      doctor: item.doctor,
      appointment: item.appointment,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
