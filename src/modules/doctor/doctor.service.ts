import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorRepository } from './doctor.repository';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorOutputDto } from './dto/doctor-output.dto';
import { PaginatedResponse, createPaginatedResponse } from '../../pagination.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async create(dto: CreateDoctorDto, createdBy?: string): Promise<DoctorOutputDto> {
    const doctorData: any = { ...dto };
    if (createdBy) {
      doctorData.createdBy = createdBy;
    }
    const created = await this.doctorRepository.create(doctorData);
    return this.mapToOutput(created);
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<DoctorOutputDto>> {
    // Pagination defaults: page 1, limit 10, max 100
    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      this.doctorRepository.findAll(skip, itemsPerPage),
      this.doctorRepository.count(),
    ]);

    const data = items.map((item) => this.mapToOutput(item));
    return createPaginatedResponse(data, total, currentPage, itemsPerPage);
  }

  async findOne(id: string): Promise<DoctorOutputDto> {
    const item = await this.doctorRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return this.mapToOutput(item);
  }

  async update(
    id: string,
    dto: UpdateDoctorDto,
    lastModifiedBy?: string,
  ): Promise<DoctorOutputDto> {
    const updateData: any = { ...dto };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    const updated = await this.doctorRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return this.mapToOutput(updated);
  }

  /**
   * Get doctor profile by userId (for self-service)
   */
  async getProfileByUserId(userId: string): Promise<DoctorOutputDto> {
    const doctor = await this.doctorRepository.findOne({ userId, isDeleted: { $ne: true } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }
    return this.mapToOutput(doctor);
  }

  /**
   * Update doctor profile by userId (for self-service)
   */
  async updateProfileByUserId(userId: string, dto: UpdateDoctorDto): Promise<DoctorOutputDto> {
    const doctor = await this.doctorRepository.findOne({ userId, isDeleted: { $ne: true } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Update the profile
    return this.update((doctor as any)._id.toString(), dto, userId);
  }

  async remove(id: string, deletedBy?: string): Promise<void> {
    // Soft delete with audit trail
    const updated = await this.doctorRepository.update(id, {
      isActive: false,
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    });
    if (!updated) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  private mapToOutput(item: any): DoctorOutputDto {
    return {
      id: item._id?.toString() || item.id,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      phone: item.phone,
      specialization: item.specialization,
      licenseNumber: item.licenseNumber,
      yearsOfExperience: item.yearsOfExperience,
      salary: item.salary,
      workSchedule: item.workSchedule,
      isActive: item.isActive,
      department: item.department,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
