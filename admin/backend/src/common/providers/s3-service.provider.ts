import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { Provider } from '@nestjs/common';

/**
 * Creates an S3Service provider factory for a specific bucket configuration key
 * @param bucketConfigKey - The key in AppConfigService that contains the bucket name
 * @returns A NestJS provider configuration
 */
export function createS3ServiceProvider(
  bucketConfigKey: keyof AppConfigService,
): Provider {
  return {
    provide: S3Service,
    useFactory: (s3Factory: S3ServiceFactory, appConfig: AppConfigService) => {
      const bucketName = appConfig[bucketConfigKey] as string;
      return s3Factory.createForBucket(bucketName);
    },
    inject: [S3ServiceFactory, AppConfigService],
  };
}
