import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { BaseRepository } from '../../common/base.repository';

@Injectable()
export class DepartmentRepository extends BaseRepository<DepartmentDocument> {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(departmentModel, connection);
  }

  async create(data: Partial<Department>): Promise<Department> {
    const created = new this.departmentModel(data);
    const saved = await created.save();
    return saved.toObject() as Department;
  }

  async findAll(skip: number = 0, limit: number = 10): Promise<Department[]> {
    return this.departmentModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Most recent first
      .lean()
      .exec() as Promise<Department[]>;
  }

  async findById(id: string): Promise<Department | null> {
    return this.departmentModel.findById(id).lean().exec() as Promise<Department | null>;
  }

  async update(id: string, data: Partial<Department>): Promise<Department | null> {
    return this.departmentModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec() as Promise<Department | null>;
  }

  async delete(id: string): Promise<Department | null> {
    return this.departmentModel.findByIdAndDelete(id).lean().exec() as Promise<Department | null>;
  }

  async count(): Promise<number> {
    return this.departmentModel.countDocuments().exec();
  }

  async findByName(name: string): Promise<Department | null> {
    return this.departmentModel.findOne({ name }).lean().exec() as Promise<Department | null>;
  }

  /**
   * Relationship Management Methods
   */
}
