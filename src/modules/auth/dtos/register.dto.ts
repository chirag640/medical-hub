import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user registration
 * Automatically creates a Patient account with basic profile
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Email address for the account. Will be used for login and notifications.',
    example: 'patient@example.com',
    format: 'email',
    minLength: 5,
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim()?.toLowerCase()) // Sanitize and normalize email
  @IsEmail()
  email!: string;

  @ApiProperty({
    description:
      'Strong password for the account. Must contain uppercase, lowercase, number, and special character.',
    example: 'Patient@123',
    minLength: 8,
    maxLength: 72,
    format: 'password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  password!: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;
}
