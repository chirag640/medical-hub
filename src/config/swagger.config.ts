import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Setup Swagger API documentation
 * Accessible at /api/docs
 */
export function setupSwagger(app: INestApplication): void {
  // Prevent Swagger exposure in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SWAGGER !== 'true') {
    console.log('📚 Swagger documentation disabled in production');
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('Medical Hub API')
    .setDescription(
      `
# Medical Hub API Documentation

Complete medical records management system with authentication, authorization, and patient management.

## Authentication Flow

### 1. Patient Self-Registration
- **POST /auth/register** - Create new patient account
- Automatically creates patient profile with QR code
- Returns JWT tokens for immediate use
- Email verification sent (optional)

### 2. Login (All User Types)
- **POST /auth/login** - Authenticate with email/password
- Supports: Patient, Doctor, Nurse, Admin, Receptionist
- Returns access token (15 min) + refresh token (7 days)
- Account locks after 5 failed attempts (60 min cooldown)

### 3. Token Management
- **POST /auth/refresh** - Get new access token with refresh token
- **POST /auth/logout** - Invalidate refresh token
- **GET /auth/profile** - Get current user info

### 4. Admin User Creation
- **POST /auth/admin/create-user** - Admin only: Create staff users with roles

## Authorization

Protected endpoints require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

Role-based access control (RBAC):
- **Patient**: Own medical records, appointments
- **Doctor**: View/update assigned patients, prescriptions
- **Nurse**: Assist doctors, update patient info
- **Receptionist**: Schedule appointments, manage patient check-ins
- **Admin**: Full system access, user management

## Rate Limiting

- Registration: 3 attempts per 5 minutes
- Login: 5 attempts per 5 minutes
- Refresh: 5 attempts per minute
- General: 100 requests per minute

## Error Handling

Standard error response format:
\`\`\`json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
\`\`\`

## Getting Started

1. Register as patient: **POST /auth/register**
2. Use returned tokens to access API
3. Complete profile: **PATCH /patients/me/profile**
4. Book appointments: **POST /appointments**
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token (obtained from /auth/login or /auth/register)',
        in: 'header',
      },
      'bearer', // Default name - matches @ApiBearerAuth() without parameters
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  console.log('📚 Swagger documentation available at /api/docs');
}
