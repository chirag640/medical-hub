import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordOutputDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'recordDate',
    example: 'null',
  })
  recordDate!: Date;

  @ApiProperty({
    description: 'recordType',
    example: 'null',
  })
  recordType!: string;

  @ApiProperty({
    description: 'Title or heading',
    example: 'Sample Title',
  })
  title!: string;

  @ApiProperty({
    description: 'Description or content',
    example: 'This is a sample description text',
  })
  description!: string;

  @ApiProperty({
    description: 'attachments',
    example: 'null',
  })
  attachments!: Record<string, any>[];

  @ApiProperty({
    description: 'IsConfidential',
    example: true,
  })
  isConfidential!: boolean;

  @ApiProperty({
    description: 'vitalSigns',
    example: 'null',
  })
  vitalSigns!: Record<string, any>;

  @ApiProperty({
    description: 'patient',
    example: 'null',
  })
  patient!: any;

  @ApiProperty({
    description: 'doctor',
    example: 'null',
  })
  doctor!: any;

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
