import { Module } from '@nestjs/common';
import { PreferenceController } from './preference.controller';
import { PreferenceMicroserviceController } from './preference-microservice.controller';
import { PreferenceService } from '../../services/preference.service';
import { MemoryStorageService } from '../../storage/memory-storage.service';

@Module({
  controllers: [PreferenceController, PreferenceMicroserviceController],
  providers: [PreferenceService, MemoryStorageService],
})
export class PreferenceModule {}