import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type DoctorDocument = Doctor & MongooseDocument;

@Schema({ timestamps: true })
export class Doctor {
  // Link to User account (required - doctors must have login accounts)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId!: MongooseSchema.Types.ObjectId;

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

  // Soft Delete Support
  @Prop({
    type: Boolean,
    required: false,
    default: false,
    index: true,
  })
  isDeleted!: boolean;

  @Prop({
    type: Date,
    required: false,
  })
  deletedAt?: Date;

  @Prop({
    type: String,
    required: false,
  })
  deletedBy?: string; // User ID who deleted

  // Audit Fields
  @Prop({
    type: String,
    required: false,
  })
  createdBy?: string; // User ID who created

  @Prop({
    type: String,
    required: false,
  })
  lastModifiedBy?: string; // User ID who last updated
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

// Compound indexes for common query patterns
// Index for sorting by creation date (most common query pattern)
DoctorSchema.index({ createdAt: -1 });

// Compound index for unique field lookups with timestamps
DoctorSchema.index({ email: 1, createdAt: -1 });
