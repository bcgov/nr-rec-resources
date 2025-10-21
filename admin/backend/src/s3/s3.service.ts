import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@/app-config/app-config.service';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly appConfig: AppConfigService) {
    this.bucketName = this.appConfig.establishmentOrderDocsBucket;
    this.region = this.appConfig.awsRegion;

    this.s3Client = new S3Client({
      region: this.region,
    });

    this.logger.log(
      `S3 Service initialized - Bucket: ${this.bucketName}, Region: ${this.region}`,
    );
  }

  /**
   * List objects in S3 by prefix (rec_resource_id)
   * @param prefix - The prefix to filter S3 objects (e.g., "REC0001/")
   * @returns Array of S3 object metadata
   */
  async listObjectsByPrefix(prefix: string): Promise<
    Array<{
      key: string;
      size: number;
      lastModified: Date;
    }>
  > {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      return response.Contents.filter((item) => item.Key).map((item) => ({
        key: item.Key!,
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
      }));
    } catch (error) {
      this.logger.error(
        `Error listing objects with prefix ${prefix}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate a presigned URL for downloading an object from S3
   * @param key - The S3 object key
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Presigned URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Upload a file to S3
   * @param recResourceId - Recreation resource ID
   * @param file - File buffer
   * @param filename - Filename including extension
   * @returns S3 key of uploaded file
   */
  async uploadFile(
    recResourceId: string,
    file: Buffer,
    filename: string,
  ): Promise<string> {
    const key = `${recResourceId}/${filename}`;

    try {
      // Check if file already exists
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      // If we get here, file exists - throw error
      this.logger.error(`File already exists in S3 - Key: ${key}`);
      throw new Error(`File "${filename}" already exists`);
    } catch (error) {
      // If it's a NotFound error, file doesn't exist - proceed with upload
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        this.logger.log(
          `Uploading file to S3 - Key: ${key}, Size: ${file.length} bytes`,
        );

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file,
            ContentType: 'application/pdf',
          }),
        );

        this.logger.log(`File uploaded successfully to S3 - Key: ${key}`);
        return key;
      }

      // If it's our error message or some other error, re-throw
      this.logger.error(
        `Error uploading file to S3 for rec_resource_id ${recResourceId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param key - S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from S3 - Key: ${key}`);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully from S3 - Key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting file from S3 - Key: ${key}: ${error.message}`,
      );
      throw error;
    }
  }
}
