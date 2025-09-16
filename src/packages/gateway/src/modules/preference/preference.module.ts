import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PreferenceController } from './preference.controller';
import { PreferenceService } from './preference.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PREFERENCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PREFERENCE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PREFERENCE_SERVICE_PORT || '3002', 10),
        },
      },
    ]),
  ],
  controllers: [PreferenceController],
  providers: [PreferenceService],
})
export class PreferenceModule {}