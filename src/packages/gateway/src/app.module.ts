import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { PreferenceModule } from './modules/preference/preference.module';
import { LocationModule } from './modules/location/location.module';
import { GitHubModule } from './modules/github/github.module';
import { UserModule } from './modules/user/user.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    HealthModule,
    PreferenceModule,
    LocationModule,
    GitHubModule,
    UserModule,
  ],
})
export class AppModule {}