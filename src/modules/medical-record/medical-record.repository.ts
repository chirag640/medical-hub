import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from './schemas/medical-record.schema';
import { BaseRepository } from '../../common/base.repository';

@Injectable()
export class MedicalRecordRepository extends BaseRepository<MedicalRecordDocument> {
  constructor(
    @InjectModel(MedicalRecord.name)
    private readonly medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(medicalRecordModel, connection);
  }

  async create(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const created = new this.medicalRecordModel(data);
    const saved = await created.save();
    return saved.toObject() as MedicalRecord;
  }

  async findAll(skip: number = 0, limit: number = 10): Promise<MedicalRecord[]> {
    return this.medicalRecordModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Most recent first
      .lean()
      .exec() as Promise<MedicalRecord[]>;
  }

  async findById(id: string): Promise<MedicalRecord | null> {
    return this.medicalRecordModel.findById(id).lean().exec() as Promise<MedicalRecord | null>;
  }

  async update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
    return this.medicalRecordModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec() as Promise<MedicalRecord | null>;
  }

  async delete(id: string): Promise<MedicalRecord | null> {
    return this.medicalRecordModel
      .findByIdAndDelete(id)
      .lean()
      .exec() as Promise<MedicalRecord | null>;
  }

  async count(): Promise<number> {
    return this.medicalRecordModel.countDocuments().exec();
  }

  /**
   * Relationship Management Methods
   */
}
