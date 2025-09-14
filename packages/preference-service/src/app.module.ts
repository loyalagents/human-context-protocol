import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreferenceModule } from './modules/preference/preference.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PreferenceModule,
    HealthModule,
  ],
})
export class AppModule {}