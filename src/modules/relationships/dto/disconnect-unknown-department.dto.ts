import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisconnectUnknownDepartmentDto {
  @ApiProperty({
    description: 'ID of the Unknown record',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  unknownId!: string;

  @ApiProperty({
    description: 'ID of the Department record to disconnect',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  departmentId!: string;
}
