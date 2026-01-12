import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Module } from '@/s3/s3.module';
import { S3Service } from '@/s3/s3.service';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { ResourceDocsController } from './resource-docs.controller';
import { ResourceDocsService } from './service/resource-docs.service';

@Module({
  providers: [
    {
      provide: S3Service,
      useFactory: (
        s3Factory: S3ServiceFactory,
        appConfig: AppConfigService,
      ) => {
        return s3Factory.createForBucket(appConfig.recResourcePublicDocsBucket);
      },
      inject: [S3ServiceFactory, AppConfigService],
    },
    ResourceDocsService,
    PrismaService,
  ],
  controllers: [ResourceDocsController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 20.5 * 1024 * 1024 }, // ~20 MB limit
    }),
    PrismaModule,
    AppConfigModule,
    S3Module,
  ],
})
export class ResourceDocsModule {}
