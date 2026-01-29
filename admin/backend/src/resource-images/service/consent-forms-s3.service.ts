import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

const CONSENT_FORM_FILE_TYPE = 'pdf';

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
   * Get underlying S3 service for direct operations (e.g., cleanup)
   */
  getS3Service(): S3Service {
    return this.s3Service;
  }

  /**
   * Build the S3 key for a consent form
   */
  getConsentFormKey(
    recResourceId: string,
    imageId: string,
    docId: string,
  ): string {
    return `${recResourceId}/${imageId}/${docId}.${CONSENT_FORM_FILE_TYPE}`;
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
    const key = this.getConsentFormKey(recResourceId, imageId, docId);

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
}
