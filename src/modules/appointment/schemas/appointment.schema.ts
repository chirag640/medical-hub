import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type AppointmentDocument = Appointment & MongooseDocument;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({
    type: Date,
    required: true,
  })
  appointmentDate!: Date;

  @Prop({
    type: Number,
    required: true,
  })
  duration!: number;

  @Prop({
    type: String,
    required: true,
  })
  reason!: string;

  @Prop({
    type: String,
    required: true,
    default: 'Scheduled',
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
  })
  status!: string;

  @Prop({
    type: String,
    required: false,
  })
  notes!: string;

  @Prop({
    type: String,
    required: false,
  })
  diagnosis!: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
  })
  prescription!: Record<string, any>;

  @Prop({
    type: Number,
    required: true,
  })
  fee!: number;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isPaid!: boolean;

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

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Compound indexes for common query patterns
// Index for sorting by creation date (most common query pattern)
AppointmentSchema.index({ createdAt: -1 });
