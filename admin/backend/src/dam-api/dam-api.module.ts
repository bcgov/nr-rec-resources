import { AppConfigModule } from '@/app-config/app-config.module';
import { Module } from '@nestjs/common';
import { DamApiCoreService } from './dam-api-core.service';
import { DamApiHttpService } from './dam-api-http.service';
import { DamApiUtilsService } from './dam-api-utils.service';
import { DamApiService } from './dam-api.service';

@Module({
  imports: [AppConfigModule],
  providers: [
    DamApiService,
    DamApiCoreService,
    DamApiHttpService,
    DamApiUtilsService,
  ],
  exports: [DamApiService],
})
export class DamApiModule {}
