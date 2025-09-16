import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse, ServiceHealth } from '@personal-context-router/shared';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth(): ApiResponse<ServiceHealth> {
    const health: ServiceHealth = {
      service: 'preference-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    return {
      success: true,
      data: health,
    };
  }
}