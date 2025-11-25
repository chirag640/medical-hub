import { ApiProperty } from '@nestjs/swagger';

export class DepartmentOutputDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'Name',
    example: 'Sample Name',
  })
  name!: string;

  @ApiProperty({
    description: 'Description or content',
    example: 'This is a sample description text',
  })
  description!: string;

  @ApiProperty({
    description: 'Location',
    example: 'Sample text',
  })
  location!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  phone!: string;

  @ApiProperty({
    description: 'Budget value',
    example: 42,
  })
  budget!: number;

  @ApiProperty({
    description: 'IsActive',
    example: true,
  })
  isActive!: boolean;

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
