import {
  IsOptional,
  IsISO8601,
  IsNumber,
  IsPositive,
  Max,
  IsString,
  MinLength,
  MaxLength,
  IsIn,
  IsObject,
  Min,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import sanitizeHtml from 'sanitize-html';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'appointmentDate',
    example: 'null',
    required: true,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    // Handle various date formats
    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // Let validator handle invalid dates
    return date.toISOString(); // Normalize to ISO 8601
  })
  @IsISO8601({ strict: false })
  @Type(() => Date)
  appointmentDate!: Date;

  @ApiProperty({
    description: 'Duration value',
    example: 42,
    required: true,
    minimum: 15,
    maximum: 240,
  })
  @IsNumber()
  @IsPositive()
  @Max(240)
  duration!: number;

  @ApiProperty({
    description: 'Reason',
    example: 'Sample text',
    required: true,
    minLength: 1,
    maxLength: 500,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;

  @ApiProperty({
    description: 'status',
    example: 'null',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string "null" from frontend forms
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    return value;
  })
  @IsIn(['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'])
  status?: string;

  @ApiProperty({
    description: 'Notes',
    example: 'Sample text',
    required: false,
    minLength: 1,
    maxLength: 2000,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string "null" from frontend forms
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({
    description: 'Diagnosis',
    example: 'Sample text',
    required: false,
    minLength: 1,
    maxLength: 5000,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string "null" from frontend forms
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  diagnosis?: string;

  @ApiProperty({
    description: 'prescription',
    example: 'null',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string "null" from frontend forms
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    return value;
  })
  @IsObject()
  prescription?: Record<string, any>;

  @ApiProperty({
    description: 'Fee value',
    example: 42,
    required: true,
    maximum: 1000000,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  fee!: number;

  @ApiProperty({
    description: 'IsPaid',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string "null" from frontend forms
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    return value;
  })
  @IsBoolean()
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({
    description: 'patient',
    example: 'null',
    required: true,
  })
  @IsMongoId()
  patient!: any;

  @ApiProperty({
    description: 'doctor',
    example: 'null',
    required: true,
  })
  @IsMongoId()
  doctor!: any;
}
