import {
  IsOptional,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsObject,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import sanitizeHtml from 'sanitize-html';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    required: true,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsEmail()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'FirstName',
    example: 'John',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({
    description: 'LastName',
    example: 'Doe',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: true,
    minLength: 10,
    maxLength: 20,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone!: string;

  @ApiProperty({
    description: 'specialization',
    example: 'null',
    required: true,
  })
  @IsIn([
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Oncology',
    'Orthopedics',
    'Dermatology',
    'General Practice',
  ])
  specialization!: string;

  @ApiProperty({
    description: 'LicenseNumber',
    example: 'Sample text',
    required: true,
    minLength: 1,
    maxLength: 255,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  licenseNumber!: string;

  @ApiProperty({
    description: 'YearsOfExperience value',
    example: 42,
    required: true,
    maximum: 60,
  })
  @IsNumber()
  @Min(0)
  @Max(60)
  yearsOfExperience!: number;

  @ApiProperty({
    description: 'Salary value',
    example: 42,
    required: true,
    maximum: 1000000,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  salary!: number;

  @ApiProperty({
    description: 'workSchedule',
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
  workSchedule?: Record<string, any>;

  @ApiProperty({
    description: 'IsActive',
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
  isActive?: boolean;

  @ApiProperty({
    description: 'department',
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
  @IsMongoId()
  department?: any;
}
