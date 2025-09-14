import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@personal-context-router/shared';

async function bootstrap() {
  // Create hybrid application (HTTP + TCP microservice)
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('preference-service');

  // Setup microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: parseInt(process.env.MICROSERVICE_PORT || '3002', 10),
    },
  });

  // Enable CORS for HTTP endpoint
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = parseInt(process.env.PORT || '3001', 10);
  const microservicePort = parseInt(process.env.MICROSERVICE_PORT || '3002', 10);

  // Start all microservices
  await app.startAllMicroservices();
  
  // Start HTTP server
  await app.listen(port);

  logger.info(`Preference service HTTP server started on port ${port}`);
  logger.info(`Preference service microservice started on port ${microservicePort}`);
}

bootstrap();