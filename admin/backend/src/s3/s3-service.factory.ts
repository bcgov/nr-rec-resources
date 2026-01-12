import { AppConfigService } from '@/app-config/app-config.service';
import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from './s3.service';

/**
 * Factory service for creating S3Service instances.
 *
 * This factory centralizes the creation of S3Service instances for different buckets.
 * It maintains a singleton instance per bucket to ensure efficient resource usage.
 *
 */
@Injectable()
export class S3ServiceFactory {
  private readonly logger = new Logger(S3ServiceFactory.name);
  private readonly instances = new Map<string, S3Service>();

  constructor(private readonly appConfig: AppConfigService) {}

  /**
   * Creates or retrieves an S3Service instance for the specified bucket.
   * Maintains singleton instances per bucket for efficient resource usage.
   *
   * @param bucketName - The S3 bucket name
   * @returns S3Service instance configured for the specified bucket
   * @throws Error if bucket name is invalid
   */
  createForBucket(bucketName: string): S3Service {
    if (!bucketName?.trim()) {
      throw new Error('Bucket name is required');
    }

    const normalizedBucketName = bucketName.trim();

    // Return existing instance if available
    if (this.instances.has(normalizedBucketName)) {
      this.logger.debug(
        `Reusing existing S3Service instance for bucket: ${normalizedBucketName}`,
      );
      return this.instances.get(normalizedBucketName)!;
    }

    // Create new instance
    this.logger.log(
      `Creating new S3Service instance for bucket: ${normalizedBucketName}`,
    );
    const instance = new S3Service(this.appConfig, normalizedBucketName);
    this.instances.set(normalizedBucketName, instance);

    return instance;
  }

  /**
   * Clears all cached S3Service instances.
   * Useful for testing or when you need to force recreation of instances.
   */
  clearCache(): void {
    this.logger.debug(
      `Clearing ${this.instances.size} cached S3Service instances`,
    );
    this.instances.clear();
  }
}
