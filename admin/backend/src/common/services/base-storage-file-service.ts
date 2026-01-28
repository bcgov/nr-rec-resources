import { AppConfigService } from '@/app-config/app-config.service';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3/s3.service';
import { HttpException, Injectable, Logger } from '@nestjs/common';

/**
 * Storage configuration interface
 * Defines the storage configuration required for URL generation
 */
export interface StorageConfig {
  bucketName: string;
  cloudfrontUrl?: string;
  endpointUrl?: string;
}

/**
 * Base service class for file-related operations with cloud storage
 * Provides common functionality for resource docs, images, and establishment order docs services
 * Handles files stored in cloud storage (S3/CloudFront)
 */
@Injectable()
export abstract class BaseStorageFileService {
  protected readonly logger: Logger;
  protected readonly prisma: PrismaService;
  protected readonly appConfig: AppConfigService;
  protected readonly s3Service: S3Service;

  constructor(
    serviceName: string,
    prisma: PrismaService,
    appConfig: AppConfigService,
    s3Service: S3Service,
  ) {
    this.logger = new Logger(serviceName);
    this.prisma = prisma;
    this.appConfig = appConfig;
    this.s3Service = s3Service;
  }

  /**
   * Standardized error handling
   * @param error - Error to handle
   * @param logMessage - Message to log
   * @param userMessage - Message to show to user
   * @throws HttpException
   */
  protected handleError(
    error: unknown,
    logMessage: string,
    userMessage: string,
  ): never {
    this.logger.error(
      logMessage,
      error instanceof Error ? error.stack : undefined,
    );

    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      `${userMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
    );
  }

  /**
   * Validate that a recreation resource exists
   * @param rec_resource_id - Recreation resource ID to validate
   * @throws HttpException with status 404 if resource does not exist
   */
  protected async validateResourceExists(
    rec_resource_id: string,
  ): Promise<void> {
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
    });

    if (!resource) {
      throw new HttpException('Recreation Resource not found', 404);
    }
  }

  /**
   * Get storage configuration for this service
   * Services that use getPublicUrl() should override this method to provide their storage configuration.
   * Services that don't use public URLs (e.g., use presigned URLs) don't need to implement this.
   * @returns StorageConfig with bucket name, CloudFront URL, and endpoint URL
   * @throws Error if called but not implemented (services using getPublicUrl() must implement this)
   */
  protected getStorageConfig(): StorageConfig {
    throw new Error(
      'getStorageConfig() must be implemented by services that use getPublicUrl()',
    );
  }

  /**
   * Generate a public URL for a storage object (CloudFront or LocalStack)
   * This is for permanent/public URLs served via CloudFront distribution.
   * For temporary URLs, use getSignedUrl() from S3Service instead.
   *
   * Note: Services that use this method must implement getStorageConfig().
   * Services that use presigned URLs don't need to implement getStorageConfig().
   *
   * @param key - The storage object key
   * @returns Public URL (CloudFront URL in production, LocalStack URL in development)
   * @throws Error if getStorageConfig() is not implemented
   */
  protected getPublicUrl(key: string): string {
    if (!key) return key;

    const config = this.getStorageConfig();

    // For LocalStack, construct direct URL
    if (config.endpointUrl) {
      const endpoint = config.endpointUrl.replace(/\/$/, '');
      return `${endpoint}/${config.bucketName}/${key}`;
    }

    // For AWS production, use CloudFront distribution
    if (config.cloudfrontUrl) {
      return `${config.cloudfrontUrl}/${key}`;
    }

    return key;
  }

  /**
   * Generate a presigned upload URL using S3Service
   * Services can use this helper for common presign operations
   * @param key - S3 object key
   * @param contentType - MIME type of the file
   * @param expiresIn - Expiration time in seconds (default: 900 = 15 minutes)
   * @param tags - Optional S3 object tags
   * @returns Presigned upload URL
   */
  protected async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900,
    tags?: Record<string, string>,
  ): Promise<string> {
    return this.s3Service.getSignedUploadUrl(key, contentType, expiresIn, tags);
  }

  /**
   * Validate entity ID format (basic UUID/string validation)
   * @param entityId - The entity ID to validate
   * @param entityType - Type name for error message (e.g., 'image_id', 'document_id')
   * @throws HttpException if entityId is invalid
   */
  protected validateEntityId(entityId: string, entityType: string): void {
    if (!entityId || typeof entityId !== 'string') {
      throw new HttpException(`Invalid ${entityType}`, 400);
    }
  }
}
