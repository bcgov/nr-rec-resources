import { AppConfigModule } from '@/app-config/app-config.module';
import { createS3ServiceProvider } from '@/common/providers/s3-service.provider';
import { S3Module } from '@/s3/s3.module';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { ResourceDocsController } from './resource-docs.controller';
import { ResourceDocsService } from './service/resource-docs.service';

@Module({
  providers: [
    createS3ServiceProvider('recResourcePublicDocsBucket'),
    ResourceDocsService,
    PrismaService,
  ],
  controllers: [ResourceDocsController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 * 1.02 }, // ~25 MB limit with 2% buffer
    }),
    PrismaModule,
    AppConfigModule,
    S3Module,
  ],
})
export class ResourceDocsModule {}
