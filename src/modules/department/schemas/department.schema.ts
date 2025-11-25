import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export type DepartmentDocument = Department & MongooseDocument;

@Schema({ timestamps: true })
export class Department {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: false,
  })
  description!: string;

  @Prop({
    type: String,
    required: true,
  })
  location!: string;

  @Prop({
    type: String,
    required: true,
  })
  phone!: string;

  @Prop({
    type: Number,
    required: true,
  })
  budget!: number;

  @Prop({
    type: Boolean,
    required: false,
    default: true,
  })
  isActive!: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Compound indexes for common query patterns
// Index for sorting by creation date (most common query pattern)
DepartmentSchema.index({ createdAt: -1 });

// Compound index for unique field lookups with timestamps
DepartmentSchema.index({ name: 1, createdAt: -1 });

// Text search index for common search queries
DepartmentSchema.index({ name: 'text', description: 'text' });
