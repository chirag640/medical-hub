import { ApiProperty } from '@nestjs/swagger';

/**
 * User information returned in authentication responses
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user ID (MongoDB ObjectId)',
    example: '654abcdef123456789',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'patient@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Array of roles assigned to the user',
    example: ['Patient'],
    type: [String],
    enum: ['Patient', 'Doctor', 'Nurse', 'Admin', 'Receptionist'],
  })
  roles!: string[];

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-11-26T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-11-26T10:30:00.000Z',
  })
  updatedAt!: Date;
}

/**
 * Response returned after successful registration or login
 */
export class AuthResponseDto {
  @ApiProperty({
    description:
      'JWT access token for API authentication. Expires in 15 minutes. Include in Authorization header as "Bearer <token>"',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTRhYmNkZWYxMjM0NTY3ODkiLCJyb2xlcyI6WyJQYXRpZW50Il0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDA5MDAwfQ.abc123',
  })
  accessToken!: string;

  @ApiProperty({
    description:
      'JWT refresh token to obtain new access tokens. Expires in 7 days. Store securely.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTRhYmNkZWYxMjM0NTY3ODkiLCJyb2xlcyI6WyJQYXRpZW50Il0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwNjA0ODAwfQ.xyz789',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}

/**
 * Response returned after token refresh
 */
export class RefreshResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'New JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}

/**
 * Error response structure
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message or array of validation errors',
    example: 'Invalid credentials',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error!: string;
}
