import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PreferenceController } from './preference.controller';
import { PreferenceMicroserviceController } from './preference-microservice.controller';
import { LocationController } from './location.controller';
import { PreferenceService } from '../../services/preference.service';
import { LocationService } from '../../services/location.service';
import { PreferenceRepository } from '../../repositories/preference.repository';
import { Preference, PreferenceSchema } from '../../schemas/preference.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Preference.name, schema: PreferenceSchema }]),
  ],
  controllers: [PreferenceController, PreferenceMicroserviceController, LocationController],
  providers: [PreferenceService, LocationService, PreferenceRepository],
})
export class PreferenceModule {}
