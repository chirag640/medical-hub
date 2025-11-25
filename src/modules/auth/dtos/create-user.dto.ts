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

/**
 * DTO for admin to create users with specific roles
 * Used for creating Doctor, Nurse, Admin, Receptionist accounts
 */
export class CreateUserDto {
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  password!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one role must be specified' })
  roles!: string[];
}
