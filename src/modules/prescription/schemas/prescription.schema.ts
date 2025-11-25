import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type PrescriptionDocument = Prescription & MongooseDocument;

@Schema({ timestamps: true })
export class Prescription {
  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  prescriptionDate!: Date;

  @Prop({
    type: [MongooseSchema.Types.Mixed],
    required: true,
  })
  medications!: Record<string, any>[];

  @Prop({
    type: String,
    required: true,
  })
  instructions!: string;

  @Prop({
    type: String,
    required: true,
  })
  duration!: string;

  @Prop({
    type: Number,
    required: true,
  })
  refillsAllowed!: number;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isFilled!: boolean;

  @Prop({
    type: String,
    required: false,
  })
  pharmacyNotes!: string;

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

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  appointment!: any;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

// Compound indexes for common query patterns
// Index for sorting by creation date (most common query pattern)
PrescriptionSchema.index({ createdAt: -1 });
