import { AppConfigModule } from '@/app-config/app-config.module';
import { createS3ServiceProvider } from '@/common/providers/s3-service.provider';
import { S3Module } from '@/s3/s3.module';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { ResourceImagesController } from './resource-images.controller';
import { MAX_FILE_SIZE, MAX_FILES_COUNT } from './resource-images.constants';
import { ConsentFormsS3Service } from './service/consent-forms-s3.service';
import { ResourceImagesService } from './service/resource-images.service';

@Module({
  providers: [
    createS3ServiceProvider('recResourceImagesBucket'),
    ConsentFormsS3Service,
    S3ServiceFactory,
    ResourceImagesService,
    PrismaService,
  ],
  controllers: [ResourceImagesController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES_COUNT,
      },
      // MIME type validation is handled by multi-file validation pipe at controller level
    }),
    PrismaModule,
    AppConfigModule,
    S3Module,
  ],
})
export class ResourceImagesModule {}
