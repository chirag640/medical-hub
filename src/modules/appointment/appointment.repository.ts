import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { BaseRepository } from '../../common/base.repository';

@Injectable()
export class AppointmentRepository extends BaseRepository<AppointmentDocument> {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(appointmentModel, connection);
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const created = new this.appointmentModel(data);
    const saved = await created.save();
    return saved.toObject() as Appointment;
  }

  async findAll(skip: number = 0, limit: number = 10): Promise<Appointment[]> {
    return this.appointmentModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Most recent first
      .lean()
      .exec() as Promise<Appointment[]>;
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointmentModel.findById(id).lean().exec() as Promise<Appointment | null>;
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    return this.appointmentModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec() as Promise<Appointment | null>;
  }

  async delete(id: string): Promise<Appointment | null> {
    return this.appointmentModel.findByIdAndDelete(id).lean().exec() as Promise<Appointment | null>;
  }

  async count(): Promise<number> {
    return this.appointmentModel.countDocuments().exec();
  }

  /**
   * Relationship Management Methods
   */
}
