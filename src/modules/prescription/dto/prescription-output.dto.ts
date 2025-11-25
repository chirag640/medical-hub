import { ApiProperty } from '@nestjs/swagger';

export class PrescriptionOutputDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'prescriptionDate',
    example: 'null',
  })
  prescriptionDate!: Date;

  @ApiProperty({
    description: 'medications',
    example: 'null',
  })
  medications!: Record<string, any>[];

  @ApiProperty({
    description: 'Instructions',
    example: 'Sample text',
  })
  instructions!: string;

  @ApiProperty({
    description: 'Duration',
    example: 'Sample text',
  })
  duration!: string;

  @ApiProperty({
    description: 'RefillsAllowed value',
    example: 42,
  })
  refillsAllowed!: number;

  @ApiProperty({
    description: 'IsFilled',
    example: true,
  })
  isFilled!: boolean;

  @ApiProperty({
    description: 'PharmacyNotes',
    example: 'Sample text',
  })
  pharmacyNotes!: string;

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
    description: 'appointment',
    example: 'null',
  })
  appointment!: any;

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
