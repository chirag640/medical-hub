import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for refreshing JWT tokens
 * Exchange refresh token for new access token
 */
export class RefreshDto {
  @ApiProperty({
    description:
      'Refresh token received during login or registration. Used to obtain new access token without re-login.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTRhYmNkZWYxMjM0NTY3ODkiLCJyb2xlcyI6WyJQYXRpZW50Il0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwNjA0ODAwfQ.abc123',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
