import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { BaseRepository } from '../../common/base.repository';

@Injectable()
export class PatientRepository extends BaseRepository<PatientDocument> {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(patientModel, connection);
  }

  async create(data: Partial<Patient>): Promise<Patient> {
    const created = new this.patientModel(data);
    const saved = await created.save();
    return saved.toObject() as Patient;
  }

  async findAll(skip: number = 0, limit: number = 10, criteria: any = {}): Promise<Patient[]> {
    return this.patientModel
      .find(criteria)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Most recent first
      .lean()
      .exec() as Promise<Patient[]>;
  }

  async findOne(criteria: any): Promise<Patient | null> {
    return this.patientModel.findOne(criteria).lean().exec() as Promise<Patient | null>;
  }

  async findById(id: string): Promise<Patient | null> {
    return this.patientModel.findById(id).lean().exec() as Promise<Patient | null>;
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient | null> {
    return this.patientModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec() as Promise<Patient | null>;
  }

  async delete(id: string): Promise<Patient | null> {
    return this.patientModel.findByIdAndDelete(id).lean().exec() as Promise<Patient | null>;
  }

  async count(): Promise<number> {
    return this.patientModel.countDocuments().exec();
  }

  async findByEmail(email: string): Promise<Patient | null> {
    return this.patientModel.findOne({ email }).lean().exec() as Promise<Patient | null>;
  }
  async findBySsn(ssn: string): Promise<Patient | null> {
    return this.patientModel.findOne({ ssn }).lean().exec() as Promise<Patient | null>;
  }

  /**
   * Relationship Management Methods
   */
}
