import { ApiProperty } from '@nestjs/swagger';

export class AppointmentOutputDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'appointmentDate',
    example: 'null',
  })
  appointmentDate!: Date;

  @ApiProperty({
    description: 'Duration value',
    example: 42,
  })
  duration!: number;

  @ApiProperty({
    description: 'Reason',
    example: 'Sample text',
  })
  reason!: string;

  @ApiProperty({
    description: 'status',
    example: 'null',
  })
  status!: string;

  @ApiProperty({
    description: 'Notes',
    example: 'Sample text',
  })
  notes!: string;

  @ApiProperty({
    description: 'Diagnosis',
    example: 'Sample text',
  })
  diagnosis!: string;

  @ApiProperty({
    description: 'prescription',
    example: 'null',
  })
  prescription!: Record<string, any>;

  @ApiProperty({
    description: 'Fee value',
    example: 42,
  })
  fee!: number;

  @ApiProperty({
    description: 'IsPaid',
    example: true,
  })
  isPaid!: boolean;

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
