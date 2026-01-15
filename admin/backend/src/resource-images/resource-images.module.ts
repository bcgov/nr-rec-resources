import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Module } from '@/s3/s3.module';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { ResourceImagesController } from './resource-images.controller';
import { RecResourceImagesS3Service } from './service/rec-resource-images-s3.service';
import { ResourceImagesService } from './service/resource-images.service';

@Module({
  providers: [
    {
      provide: RecResourceImagesS3Service,
      useFactory: (
        appConfig: AppConfigService,
        s3Factory: S3ServiceFactory,
      ) => {
        return new RecResourceImagesS3Service(appConfig, s3Factory);
      },
      inject: [AppConfigService, S3ServiceFactory],
    },
    ResourceImagesService,
    PrismaService,
  ],
  controllers: [ResourceImagesController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB per file (each WebP variant is small)
        files: 4, // Maximum 4 files (original, scr, pre, thm)
      },
      // MIME type validation is handled by multi-file validation pipe at controller level
    }),
    PrismaModule,
    AppConfigModule,
    S3Module,
  ],
})
export class ResourceImagesModule {}
