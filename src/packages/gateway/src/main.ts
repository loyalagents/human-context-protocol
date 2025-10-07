import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@personal-context-router/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('gateway');

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Personal Context Router Gateway')
    .setDescription('API Gateway for microservices')
    .setVersion('1.0')
    .addTag('gateway', 'Gateway health and status endpoints')
    .addTag('users', 'User account management operations')
    .addTag('preferences', 'User preference management operations')
    .addTag('github', 'GitHub repository and user data operations')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
        name: 'Basic Authentication',
        description: 'Enter your username and password (default: admin/password123)'
      },
      'basic-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.info(`Gateway service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();