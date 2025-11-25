import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientOutputDto {
  @ApiProperty({
    description: 'MongoDB unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'Universal Patient ID (e.g., PAT-1732567890123)',
    example: 'PAT-1732567890123',
  })
  patientId!: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'rajesh.kumar@example.com',
  })
  email?: string;

  @ApiProperty({
    description: 'First name',
    example: 'Rajesh',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Kumar',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Full name',
    example: 'Rajesh Kumar',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Gender',
    example: 'Male',
    enum: ['Male', 'Female', 'Other'],
  })
  gender!: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-05-15T00:00:00.000Z',
  })
  dateOfBirth!: Date;

  @ApiProperty({
    description: 'Phone number',
    example: '9876543210',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Current residential address',
    example: 'Room 12, ABC Construction Site, Kochi, Kerala',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Aadhaar number (masked, last 4 digits only)',
    example: '****9012',
  })
  aadhaarNumber?: string;

  @ApiPropertyOptional({
    description: 'Native state',
    example: 'Bihar',
  })
  nativeState?: string;

  @ApiPropertyOptional({
    description: 'Native district',
    example: 'Patna',
  })
  nativeDistrict?: string;

  @ApiPropertyOptional({
    description: 'SSN (masked, last 4 digits only)',
    example: '***-**-6789',
  })
  ssn?: string;

  @ApiPropertyOptional({
    description: 'Passport number',
    example: 'A12345678',
  })
  passportNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance number',
    example: 'INS123456',
  })
  insuranceNumber?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    example: { name: 'Wife Name', phone: '9876543211', relationship: 'Spouse' },
  })
  emergencyContact?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical history',
    example: 'Diabetes, Hypertension since 2020',
  })
  medicalHistory?: string;

  @ApiPropertyOptional({
    description: 'Known allergies',
    example: ['Penicillin', 'Peanuts'],
  })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Current medications',
    example: ['Metformin 500mg', 'Amlodipine 5mg'],
  })
  currentMedication?: string[];

  @ApiProperty({
    description: 'Blood type (required, default: Unknown)',
    example: 'O+',
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
  })
  bloodType!: string;

  @ApiPropertyOptional({
    description: 'Profile image URL or base64',
    example: 'https://example.com/photo.jpg',
  })
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'QR code data (base64 image)',
    example: 'data:image/png;base64,iVBORw0KGg...',
  })
  qrCodeData?: string;

  @ApiProperty({
    description: 'Consent given for data storage',
    example: true,
  })
  consentGiven!: boolean;

  @ApiPropertyOptional({
    description: 'Consent date',
    example: '2024-01-01T00:00:00.000Z',
  })
  consentDate?: Date;

  @ApiPropertyOptional({
    description: 'Tenant/Hospital ID',
    example: '507f1f77bcf86cd799439011',
  })
  tenantId?: string;

  @ApiProperty({
    description: 'Account active status',
    example: true,
  })
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Soft delete flag',
    example: false,
  })
  isDeleted?: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}
