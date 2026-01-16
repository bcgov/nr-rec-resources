import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Specialized S3 service for recreation resource images.
 * Uses composition with S3Service to provide image-specific business logic:
 * - Variant management (original, scr, pre, thm)
 * - Transactional uploads with rollback
 * - Image-specific metadata tagging
 */
@Injectable()
export class RecResourceImagesS3Service {
  private readonly logger = new Logger(RecResourceImagesS3Service.name);
  private readonly s3Service: S3Service;

  constructor(
    private readonly appConfig: AppConfigService,
    s3Factory: S3ServiceFactory,
  ) {
    // Use factory to get S3Service instance for the images bucket
    this.s3Service = s3Factory.createForBucket(
      appConfig.recResourceImagesBucket,
    );

    this.logger.log(
      `RecResourceImagesS3Service initialized with bucket: ${this.s3Service.getBucketName()}`,
    );
  }

  /**
   * Upload image variant to S3 from buffer
   * @param recResourceId - Recreation resource ID
   * @param imageId - Image UUID
   * @param sizeCode - Variant size code (original, scr, pre, thm)
   * @param buffer - File buffer from memory
   * @param metadata - Optional metadata to store as S3 tags (only used for 'original' variant; filename tag stores the image file name)
   * @returns S3 key of uploaded file
   */
  async uploadImageVariant(
    recResourceId: string,
    imageId: string,
    sizeCode: string,
    buffer: Buffer,
    metadata?: { filename: string },
  ): Promise<string> {
    const key = `images/${recResourceId}/${imageId}/${sizeCode}.webp`;

    try {
      this.logger.log(
        `Uploading image variant to S3 - Key: ${key}, Size: ${buffer.length} bytes`,
      );

      const tagString = metadata?.filename
        ? `filename=${metadata.filename}`
        : undefined;

      // Use getter methods to access S3Service internals
      const s3Client = this.s3Service.getS3Client();
      const bucketName = this.s3Service.getBucketName();

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'image/webp',
          Tagging: tagString,
        }),
      );

      this.logger.log(
        `Image variant uploaded successfully to S3 - Key: ${key}`,
      );
      return key;
    } catch (error) {
      this.logger.error(
        `Error uploading image variant to S3 - Key: ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Upload multiple image variants to S3 (transactional)
   * All uploads must succeed or all are rolled back
   * @param recResourceId - Recreation resource ID
   * @param imageId - Image UUID
   * @param variants - Array of variants with sizeCode, buffer, and optional metadata
   * @returns Array of S3 keys for uploaded files
   */
  async uploadImageVariants(
    recResourceId: string,
    imageId: string,
    variants: Array<{
      sizeCode: string;
      buffer: Buffer;
      metadata?: { filename: string };
    }>,
  ): Promise<string[]> {
    const uploadedKeys: string[] = [];

    try {
      // Upload all variants with metadata
      for (const variant of variants) {
        const key = await this.uploadImageVariant(
          recResourceId,
          imageId,
          variant.sizeCode,
          variant.buffer,
          variant.metadata,
        );
        uploadedKeys.push(key);
      }

      this.logger.log(
        `All ${variants.length} image variants uploaded successfully for imageId: ${imageId}`,
      );
      return uploadedKeys;
    } catch (error) {
      // Rollback: Delete all successfully uploaded files
      this.logger.error(
        `Error uploading image variants, rolling back ${uploadedKeys.length} uploaded files`,
      );

      for (const key of uploadedKeys) {
        try {
          await this.s3Service.deleteFile(key);
        } catch {
          this.logger.error(
            `Failed to rollback file during cleanup - Key: ${key}`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Delete all variants for an image
   * @param recResourceId - Recreation resource ID
   * @param imageId - Image UUID
   */
  async deleteImageVariants(
    recResourceId: string,
    imageId: string,
  ): Promise<void> {
    const prefix = `images/${recResourceId}/${imageId}/`;

    try {
      // List all variants
      const objects = await this.s3Service.listObjectsByPrefix(prefix);

      this.logger.log(
        `Deleting ${objects.length} image variants for imageId: ${imageId}`,
      );

      // Delete each variant
      for (const object of objects) {
        await this.s3Service.deleteFile(object.key);
      }

      this.logger.log(
        `All image variants deleted successfully for imageId: ${imageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting image variants for imageId: ${imageId}: ${error.message}`,
      );
      throw error;
    }
  }
}
