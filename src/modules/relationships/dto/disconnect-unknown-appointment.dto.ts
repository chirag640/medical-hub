import { IsMongoId, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisconnectUnknownAppointmentDto {
  @ApiProperty({
    description: 'ID of the Unknown record',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  unknownId!: string;

  @ApiProperty({
    description: 'Array of Appointment IDs to disconnect',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  appointmentIds!: string[];
}
