import { AppConfigModule } from '@/app-config/app-config.module';
import { Module } from '@nestjs/common';
import { S3ServiceFactory } from './s3-service.factory';

/**
 * S3 Module
 *
 * Provides S3ServiceFactory for creating S3Service instances configured for specific buckets.
 *
 * The factory maintains singleton instances per bucket for efficient resource usage.
 *
 * Supports both AWS production and LocalStack for local development.
 * Configure via AWS_ENDPOINT_URL environment variable for LocalStack.
 */
@Module({
  imports: [AppConfigModule],
  providers: [S3ServiceFactory],
  exports: [S3ServiceFactory],
})
export class S3Module {}
