import { Module, Provider } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BcgwController } from './bcgw.controller';
import { BcgwService } from './bcgw.service';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { BcgwAuthModule } from './auth/bcgw-auth.module';
import { AppConfigModule } from '@/app-config/app-config.module';
import { S3Module } from '@/s3/s3.module';
import { S3Service } from '@/s3/s3.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { AppConfigService } from '@/app-config/app-config.service';
import { BcgwExportService } from './export/bcgw-export.service';
import { BcgwExportScheduler } from './export/bcgw-export.scheduler';

/**
 * Yields null when BCGW_EXPORTS_BUCKET is unset, rather than the shared
 * createS3ServiceProvider which assumes the bucket is always configured. The rest
 * of the admin API does not use this bucket, so a missing one should not stop the
 * whole service from booting - the BCGW routes report it instead.
 */
const bcgwS3ServiceProvider: Provider = {
  provide: S3Service,
  useFactory: (s3Factory: S3ServiceFactory, appConfig: AppConfigService) => {
    const bucket = appConfig.bcgwExportsBucket;
    return bucket ? s3Factory.createForBucket(bucket) : null;
  },
  inject: [S3ServiceFactory, AppConfigService],
};

@Module({
  imports: [
    PrismaModule,
    BcgwAuthModule,
    AppConfigModule,
    S3Module,
    ScheduleModule.forRoot(),
  ],
  controllers: [BcgwController],
  providers: [
    bcgwS3ServiceProvider,
    BcgwService,
    BcgwExportService,
    BcgwExportScheduler,
    PrismaService,
  ],
})
export class BcgwModule {}
