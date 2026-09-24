import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BcgwController } from './bcgw.controller';
import { BcgwService } from './bcgw.service';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { BcgwAuthModule } from './auth/bcgw-auth.module';
import { AppConfigModule } from '@/app-config/app-config.module';
import { S3Module } from '@/s3/s3.module';
import { createS3ServiceProvider } from '@/common/providers/s3-service.provider';
import { BcgwExportService } from './export/bcgw-export.service';
import { BcgwExportScheduler } from './export/bcgw-export.scheduler';

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
    createS3ServiceProvider('bcgwExportsBucket'),
    BcgwService,
    BcgwExportService,
    BcgwExportScheduler,
    PrismaService,
  ],
})
export class BcgwModule {}
