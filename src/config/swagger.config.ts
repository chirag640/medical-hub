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
    .setTitle('medical-hub API')
    .setDescription(
      'Complete medical records management system with FLAC, RBAC, OAuth, and production features',
    )
    .setVersion('1.0')
    .addTag('medical-hub')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controllers
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
