import { Controller, Get } from '@nestjs/common';
import { ServiceHealth } from '@personal-context-router/shared';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  getHealth(): ServiceHealth {
    return {
      service: 'user-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };
  }
}