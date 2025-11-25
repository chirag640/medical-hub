import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type DoctorDocument = Doctor & MongooseDocument;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName!: string;

  @Prop({
    type: String,
    required: true,
  })
  phone!: string;

  @Prop({
    type: String,
    required: true,
    enum: [
      'Cardiology',
      'Neurology',
      'Pediatrics',
      'Oncology',
      'Orthopedics',
      'Dermatology',
      'General Practice',
    ],
  })
  specialization!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  licenseNumber!: string;

  @Prop({
    type: Number,
    required: true,
  })
  yearsOfExperience!: number;

  @Prop({
    type: Number,
    required: true,
  })
  salary!: number;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
  })
  workSchedule!: Record<string, any>;

  @Prop({
    type: Boolean,
    required: false,
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
  })
  department!: any;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

// Compound indexes for common query patterns
// Index for sorting by creation date (most common query pattern)
DoctorSchema.index({ createdAt: -1 });

// Compound index for unique field lookups with timestamps
DoctorSchema.index({ email: 1, createdAt: -1 });
