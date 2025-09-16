import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PreferenceController } from './preference.controller';
import { PreferenceMicroserviceController } from './preference-microservice.controller';
import { PreferenceService } from '../../services/preference.service';
import { PreferenceRepository } from '../../repositories/preference.repository';
import { Preference, PreferenceSchema } from '../../schemas/preference.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Preference.name, schema: PreferenceSchema }])
  ],
  controllers: [PreferenceController, PreferenceMicroserviceController],
  providers: [PreferenceService, PreferenceRepository],
})
export class PreferenceModule {}