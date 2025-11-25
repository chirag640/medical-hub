import { ApiProperty } from '@nestjs/swagger';

export class DoctorOutputDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'FirstName',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'LastName',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  phone!: string;

  @ApiProperty({
    description: 'specialization',
    example: 'null',
  })
  specialization!: string;

  @ApiProperty({
    description: 'LicenseNumber',
    example: 'Sample text',
  })
  licenseNumber!: string;

  @ApiProperty({
    description: 'YearsOfExperience value',
    example: 42,
  })
  yearsOfExperience!: number;

  @ApiProperty({
    description: 'Salary value',
    example: 42,
  })
  salary!: number;

  @ApiProperty({
    description: 'workSchedule',
    example: 'null',
  })
  workSchedule!: Record<string, any>;

  @ApiProperty({
    description: 'IsActive',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'department',
    example: 'null',
  })
  department!: any;

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
