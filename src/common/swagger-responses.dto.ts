import { ApiProperty } from '@nestjs/swagger';

/**
 * Common Swagger Response DTOs
 * Reusable across all controllers for consistent API documentation
 */

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message describing what went wrong',
    example: 'Validation failed',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error!: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Array of validation error messages',
    example: ['email must be an email', 'password must be longer than or equal to 8 characters'],
    isArray: true,
  })
  message!: string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error!: string;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Resource with ID 507f1f77bcf86cd799439011 not found',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error!: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Unauthorized - Invalid or missing token',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Unauthorized',
  })
  error!: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Insufficient permissions. Required roles: Admin',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Forbidden',
  })
  error!: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for current page',
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: 'Total number of items across all pages',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number (1-indexed)',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages!: number;
}

export class SuccessMessageResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message!: string;
}
