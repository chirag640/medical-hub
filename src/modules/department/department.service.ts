import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from './department.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentOutputDto } from './dto/department-output.dto';
import { PaginatedResponse, createPaginatedResponse } from '../../pagination.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async create(dto: CreateDepartmentDto): Promise<DepartmentOutputDto> {
    const created = await this.departmentRepository.create(dto);
    return this.mapToOutput(created);
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<DepartmentOutputDto>> {
    // Pagination defaults: page 1, limit 10, max 100
    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      this.departmentRepository.findAll(skip, itemsPerPage),
      this.departmentRepository.count(),
    ]);

    const data = items.map((item) => this.mapToOutput(item));
    return createPaginatedResponse(data, total, currentPage, itemsPerPage);
  }

  async findOne(id: string): Promise<DepartmentOutputDto> {
    const item = await this.departmentRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return this.mapToOutput(item);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentOutputDto> {
    const updated = await this.departmentRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return this.mapToOutput(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.departmentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  private mapToOutput(item: any): DepartmentOutputDto {
    return {
      id: item._id?.toString() || item.id,
      name: item.name,
      description: item.description,
      location: item.location,
      phone: item.phone,
      budget: item.budget,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
