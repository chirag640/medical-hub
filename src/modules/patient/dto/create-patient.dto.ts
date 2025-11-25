/**
 * Universal Patient Registration DTO
 *
 * This DTO works for ALL patients worldwide without any type distinctions.
 *
 * REQUIRED FIELDS:
 * - firstName, lastName, gender, dateOfBirth, phone, bloodType (default: Unknown), consentGiven
 *
 * OPTIONAL FIELDS (based on patient's country/situation):
 * - email (required for login/authentication)
 * - Identification: aadhaarNumber (India), ssn (USA), passportNumber (International)
 * - Addresses: address (current), nativeState, nativeDistrict
 * - Medical: medicalHistory, allergies, currentMedication (helps doctors with prescriptions)
 * - Insurance: insuranceNumber
 * - Emergency: emergencyContact
 * - Other: profileImage, tenantId (multi-tenant)
 */
import {
  IsOptional,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsISO8601,
  Matches,
  IsObject,
  IsArray,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import sanitizeHtml from 'sanitize-html';

export class CreatePatientDto {
  @ApiPropertyOptional({
    description: 'Email address (optional, but required for account login)',
    example: 'patient@example.com',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'First name',
    example: 'Rajesh',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Kumar',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({
    description: 'Gender',
    example: 'Male',
    enum: ['Male', 'Female', 'Other'],
  })
  @IsString()
  @IsIn(['Male', 'Female', 'Other'])
  gender!: string;

  @ApiProperty({
    description: 'dateOfBirth',
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
  dateOfBirth!: Date;

  @ApiProperty({
    description: 'Phone number (10 digits for India, or international format)',
    example: '9876543210',
    minLength: 10,
    maxLength: 15,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @Matches(/^[6-9]\d{9}$|^\+?[1-9]\d{1,14}$/, {
    message:
      'Phone must be a valid Indian mobile (10 digits starting with 6-9) or international format',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Current residential address',
    example: 'Room 12, ABC Construction Site, Kochi, Kerala',
    minLength: 5,
    maxLength: 500,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return value;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    description: 'Aadhaar number (12 digits, will be encrypted)',
    example: '123456789012',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const trimmed = value.trim().replace(/\s/g, '');
    return trimmed;
  })
  @IsString()
  @Matches(/^\d{12}$/, { message: 'Aadhaar must be exactly 12 digits' })
  aadhaarNumber?: string;

  @ApiPropertyOptional({
    description: 'Native/home state (optional)',
    example: 'Bihar',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MaxLength(100)
  nativeState?: string;

  @ApiPropertyOptional({
    description: 'Native/home district (optional)',
    example: 'Patna',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MaxLength(100)
  nativeDistrict?: string;
  @ApiPropertyOptional({
    description: 'Social Security Number (optional, for USA patients)',
    example: '123-45-6789',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @Matches(/^\d{3}-\d{2}-\d{4}$/, { message: 'SSN must be in format XXX-XX-XXXX' })
  ssn?: string;

  @ApiPropertyOptional({
    description: 'Insurance number (optional)',
    example: 'INS123456',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return undefined;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MaxLength(100)
  insuranceNumber?: string;

  @ApiProperty({
    description: 'emergencyContact',
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
  emergencyContact?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical history (will be encrypted)',
    example: 'Diabetes, Hypertension since 2020',
    maxLength: 5000,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return undefined;
    const trimmed = value.trim();
    return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
  })
  @IsString()
  @MaxLength(5000)
  medicalHistory?: string;

  @ApiPropertyOptional({
    description: 'Known allergies (will be encrypted)',
    example: ['Penicillin', 'Peanuts'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return undefined;
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Current medications (will be encrypted)',
    example: ['Metformin 500mg', 'Amlodipine 5mg'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return undefined;
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  currentMedication?: string[];

  @ApiProperty({
    description: 'Blood type (required, default: Unknown)',
    example: 'O+',
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  })
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '' || !value) return 'Unknown';
    return value;
  })
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
  bloodType!: string;

  @ApiPropertyOptional({
    description: 'Profile image URL or base64',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null' || value === 'undefined' || value === '') return undefined;
    if (!value) return undefined;
    return value;
  })
  @IsString()
  @MaxLength(10000) // Allow base64 images
  profileImage?: string;

  @ApiProperty({
    description: 'HIPAA/GDPR consent given',
    example: true,
    default: false,
  })
  @IsBoolean()
  consentGiven!: boolean;

  @ApiPropertyOptional({
    description: 'Account active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Tenant/Hospital ID (for multi-tenant support)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
