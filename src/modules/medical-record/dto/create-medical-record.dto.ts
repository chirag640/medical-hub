import {
  IsOptional,
  IsISO8601,
  IsIn,
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsObject,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import sanitizeHtml from 'sanitize-html';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'recordDate',
    example: 'null',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string "null" from frontend forms
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    // Handle various date formats
    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // Let validator handle invalid dates
    return date.toISOString(); // Normalize to ISO 8601
  })
  @IsISO8601({ strict: false })
  @Type(() => Date)
  recordDate?: Date;

  @ApiProperty({
    description: 'recordType',
    example: 'null',
    required: true,
  })
  @IsIn(['Consultation', 'Lab Result', 'Imaging', 'Surgery', 'Vaccination', 'Prescription'])
  recordType!: string;

  @ApiProperty({
    description: 'Title or heading',
    example: 'Sample Title',
    required: true,
    minLength: 3,
    maxLength: 200,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Description or content',
    example: 'This is a sample description text',
    required: true,
    minLength: 10,
    maxLength: 5000,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    description: 'attachments',
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
  @IsArray()
  @IsObject({ each: true })
  attachments?: Record<string, any>[];

  @ApiProperty({
    description: 'IsConfidential',
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
  isConfidential?: boolean;

  @ApiProperty({
    description: 'vitalSigns',
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
  vitalSigns?: Record<string, any>;

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
