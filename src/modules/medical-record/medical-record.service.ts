import { Injectable, NotFoundException } from '@nestjs/common';
import { MedicalRecordRepository } from './medical-record.repository';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordOutputDto } from './dto/medical-record-output.dto';
import { PaginatedResponse, createPaginatedResponse } from '../../pagination.dto';

@Injectable()
export class MedicalRecordService {
  constructor(private readonly medicalRecordRepository: MedicalRecordRepository) {}

  async create(dto: CreateMedicalRecordDto): Promise<MedicalRecordOutputDto> {
    const created = await this.medicalRecordRepository.create(dto);
    return this.mapToOutput(created);
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<MedicalRecordOutputDto>> {
    // Pagination defaults: page 1, limit 10, max 100
    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      this.medicalRecordRepository.findAll(skip, itemsPerPage),
      this.medicalRecordRepository.count(),
    ]);

    const data = items.map((item) => this.mapToOutput(item));
    return createPaginatedResponse(data, total, currentPage, itemsPerPage);
  }

  async findOne(id: string): Promise<MedicalRecordOutputDto> {
    const item = await this.medicalRecordRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`MedicalRecord with ID ${id} not found`);
    }
    return this.mapToOutput(item);
  }

  async update(id: string, dto: UpdateMedicalRecordDto): Promise<MedicalRecordOutputDto> {
    const updated = await this.medicalRecordRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`MedicalRecord with ID ${id} not found`);
    }
    return this.mapToOutput(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.medicalRecordRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`MedicalRecord with ID ${id} not found`);
    }
  }

  private mapToOutput(item: any): MedicalRecordOutputDto {
    return {
      id: item._id?.toString() || item.id,
      recordDate: item.recordDate,
      recordType: item.recordType,
      title: item.title,
      description: item.description,
      attachments: item.attachments,
      isConfidential: item.isConfidential,
      vitalSigns: item.vitalSigns,
      patient: item.patient,
      doctor: item.doctor,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
