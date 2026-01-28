import { AppConfigModule } from '@/app-config/app-config.module';
import { createS3ServiceProvider } from '@/common/providers/s3-service.provider';
import { S3Module } from '@/s3/s3.module';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { ResourceImagesController } from './resource-images.controller';
import { ResourceImagesService } from './service/resource-images.service';

@Module({
  providers: [
    createS3ServiceProvider('recResourceImagesBucket'),
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
