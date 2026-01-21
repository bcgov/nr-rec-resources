import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Specialized S3 service for consent forms.
 * Uses composition with S3Service to provide consent form-specific business logic:
 * - PDF uploads for consent/release forms
 * - Private bucket storage (no CloudFront access)
 */
@Injectable()
export class ConsentFormsS3Service {
  private readonly logger = new Logger(ConsentFormsS3Service.name);
  private readonly s3Service: S3Service;

  constructor(
    private readonly appConfig: AppConfigService,
    s3Factory: S3ServiceFactory,
  ) {
    this.s3Service = s3Factory.createForBucket(
      appConfig.recResourceConsentFormsBucket,
    );

    this.logger.log(
      `ConsentFormsS3Service initialized with bucket: ${this.s3Service.getBucketName()}`,
    );
  }

  /**
   * Upload consent form PDF to S3
   * @param recResourceId - Recreation resource ID
   * @param imageId - Image UUID this consent form belongs to
   * @param docId - Document UUID for the consent form
   * @param buffer - PDF file buffer from memory
   * @param originalFileName - Original file name for tagging
   * @returns S3 key of uploaded file
   */
  async uploadConsentForm(
    recResourceId: string,
    imageId: string,
    docId: string,
    buffer: Buffer,
    originalFileName?: string,
  ): Promise<string> {
    const key = `${recResourceId}/${imageId}/${docId}.pdf`;

    try {
      this.logger.log(
        `Uploading consent form to S3 - Key: ${key}, Size: ${buffer.length} bytes`,
      );

      const tagString = originalFileName
        ? `filename=${encodeURIComponent(originalFileName)}`
        : undefined;

      const s3Client = this.s3Service.getS3Client();
      const bucketName = this.s3Service.getBucketName();

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'application/pdf',
          Tagging: tagString,
        }),
      );

      this.logger.log(`Consent form uploaded successfully to S3 - Key: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(
        `Error uploading consent form to S3 - Key: ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Delete consent form from S3
   * @param recResourceId - Recreation resource ID
   * @param imageId - Image UUID
   * @param docId - Document UUID
   */
  async deleteConsentForm(
    recResourceId: string,
    imageId: string,
    docId: string,
  ): Promise<void> {
    const key = `${recResourceId}/${imageId}/${docId}.pdf`;

    try {
      await this.s3Service.deleteFile(key);
      this.logger.log(`Consent form deleted from S3 - Key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting consent form from S3 - Key: ${key}: ${error.message}`,
      );
      throw error;
    }
  }
}
