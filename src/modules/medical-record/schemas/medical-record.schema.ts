import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & MongooseDocument;

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  recordDate!: Date;

  @Prop({
    type: String,
    required: true,
    enum: ['Consultation', 'Lab Result', 'Imaging', 'Surgery', 'Vaccination', 'Prescription'],
  })
  recordType!: string;

  @Prop({
    type: String,
    required: true,
  })
  title!: string;

  @Prop({
    type: String,
    required: true,
  })
  description!: string;

  @Prop({
    type: [MongooseSchema.Types.Mixed],
    required: false,
  })
  attachments!: Record<string, any>[];

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isConfidential!: boolean;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
  })
  vitalSigns!: Record<string, any>;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  patient!: any;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  doctor!: any;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

// Compound indexes for common query patterns
// Index for sorting by creation date (most common query pattern)
MedicalRecordSchema.index({ createdAt: -1 });

// Text search index for common search queries
MedicalRecordSchema.index({ title: 'text', description: 'text' });
