import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Prescription, PrescriptionDocument } from './schemas/prescription.schema';
import { BaseRepository } from '../../common/base.repository';

@Injectable()
export class PrescriptionRepository extends BaseRepository<PrescriptionDocument> {
  constructor(
    @InjectModel(Prescription.name)
    private readonly prescriptionModel: Model<PrescriptionDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(prescriptionModel, connection);
  }

  async create(data: Partial<Prescription>): Promise<Prescription> {
    const created = new this.prescriptionModel(data);
    const saved = await created.save();
    return saved.toObject() as Prescription;
  }

  async findAll(skip: number = 0, limit: number = 10): Promise<Prescription[]> {
    return this.prescriptionModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Most recent first
      .lean()
      .exec() as Promise<Prescription[]>;
  }

  async findById(id: string): Promise<Prescription | null> {
    return this.prescriptionModel.findById(id).lean().exec() as Promise<Prescription | null>;
  }

  async update(id: string, data: Partial<Prescription>): Promise<Prescription | null> {
    return this.prescriptionModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec() as Promise<Prescription | null>;
  }

  async delete(id: string): Promise<Prescription | null> {
    return this.prescriptionModel
      .findByIdAndDelete(id)
      .lean()
      .exec() as Promise<Prescription | null>;
  }

  async count(): Promise<number> {
    return this.prescriptionModel.countDocuments().exec();
  }

  /**
   * Relationship Management Methods
   */
}
