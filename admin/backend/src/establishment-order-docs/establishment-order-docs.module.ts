import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Module } from '@/s3/s3.module';
import { S3Service } from '@/s3/s3.service';
import { Module } from '@nestjs/common';
import { EstablishmentOrderDocsController } from './establishment-order-docs.controller';
import { EstablishmentOrderDocsService } from './establishment-order-docs.service';

@Module({
  imports: [PrismaModule, AppConfigModule, S3Module],
  controllers: [EstablishmentOrderDocsController],
  providers: [
    {
      provide: S3Service,
      useFactory: (
        s3Factory: S3ServiceFactory,
        appConfig: AppConfigService,
      ) => {
        return s3Factory.createForBucket(
          appConfig.establishmentOrderDocsBucket,
        );
      },
      inject: [S3ServiceFactory, AppConfigService],
    },
    EstablishmentOrderDocsService,
    PrismaService,
  ],
  exports: [EstablishmentOrderDocsService],
})
export class EstablishmentOrderDocsModule {}
