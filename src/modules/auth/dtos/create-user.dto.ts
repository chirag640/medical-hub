import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for admin to create users with specific roles
 * Used for creating Doctor, Nurse, Admin, Receptionist accounts
 * Requires Admin role to access this endpoint
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Email address for the staff account',
    example: 'dr.smith@hospital.com',
    format: 'email',
  })
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  @IsEmail()
  email!: string;

  @ApiProperty({
    description:
      'Strong password. Must contain uppercase, lowercase, number, and special character.',
    example: 'Doctor@123',
    format: 'password',
    minLength: 8,
    maxLength: 72,
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
    description: 'First name of the staff member',
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
    description: 'Last name of the staff member',
    example: 'Smith',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({
    description:
      'Array of roles to assign. Available roles: Doctor, Nurse, Admin, Receptionist, Patient',
    example: ['Doctor'],
    type: [String],
    enum: ['Doctor', 'Nurse', 'Admin', 'Receptionist', 'Patient'],
    isArray: true,
    minItems: 1,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one role must be specified' })
  roles!: string[];
}
