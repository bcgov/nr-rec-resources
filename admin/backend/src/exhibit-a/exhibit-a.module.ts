import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Module } from '@/s3/s3.module';
import { S3Service } from '@/s3/s3.service';
import { Module } from '@nestjs/common';
import { ExhibitAController } from './exhibit-a.controller';
import { ExhibitAService } from './exhibit-a.service';

@Module({
  imports: [PrismaModule, AppConfigModule, S3Module],
  controllers: [ExhibitAController],
  providers: [
    {
      provide: S3Service,
      useFactory: (
        s3Factory: S3ServiceFactory,
        appConfig: AppConfigService,
      ) => {
        return s3Factory.createForBucket(appConfig.exhibitADocsBucket);
      },
      inject: [S3ServiceFactory, AppConfigService],
    },
    ExhibitAService,
    PrismaService,
  ],
  exports: [ExhibitAService],
})
export class ExhibitAModule {}
