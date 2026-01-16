import { AppConfigService } from '@/app-config/app-config.service';
import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

// Constants
const DEFAULT_PRESIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

/**
 * S3Service provides operations for interacting with AWS S3 or LocalStack.
 *
 * **Important**: This service should not be instantiated directly. Use S3ServiceFactory
 * to create instances configured for specific buckets.
 */
@Injectable()
export class S3Service {
  protected readonly logger = new Logger(S3Service.name);
  protected readonly s3Client: S3Client;
  protected readonly bucketName: string;
  protected readonly region: string;
  protected readonly endpointUrl?: string;

  constructor(
    protected readonly appConfig: AppConfigService,
    bucketName: string,
  ) {
    if (!bucketName?.trim()) {
      throw new Error('Bucket name is required');
    }

    this.bucketName = bucketName.trim();
    this.region = this.appConfig.awsRegion;
    this.endpointUrl = this.appConfig.awsEndpointUrl;

    this.s3Client = new S3Client(this.createS3ClientConfig());

    this.logger.log(
      `S3 Service initialized - Bucket: ${this.bucketName}, Region: ${this.region}${
        this.endpointUrl ? `, Endpoint: ${this.endpointUrl}` : ''
      }`,
    );
  }

  /**
   * Get the bucket name for this S3Service instance
   * @returns The bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Get the S3 client for direct operations
   * Use this when you need to perform custom S3 operations not covered by S3Service methods
   * @returns The S3Client instance
   */
  getS3Client(): S3Client {
    return this.s3Client;
  }

  /**
   * Create S3 client configuration based on environment
   * Supports both AWS production and LocalStack for local development
   */
  private createS3ClientConfig(): S3ClientConfig {
    const config: S3ClientConfig = {
      region: this.region,
    };

    if (this.endpointUrl) {
      config.endpoint = this.endpointUrl;
      config.forcePathStyle = true; // Required for LocalStack
    }

    return config;
  }

  /**
   * List objects in S3 by prefix
   * @param prefix - The prefix to filter S3 objects (e.g., "REC0001/")
   * @returns Array of S3 object metadata
   * @throws BadRequestException if prefix is invalid
   * @throws InternalServerErrorException if S3 operation fails
   */
  async listObjectsByPrefix(prefix: string): Promise<
    Array<{
      key: string;
      size: number;
      lastModified: Date;
    }>
  > {
    if (!prefix?.trim()) {
      throw new BadRequestException('Prefix is required');
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix.trim(),
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
      const errorMessage = `Failed to list objects with prefix "${prefix}" in bucket "${this.bucketName}"`;
      this.logger.error(`${errorMessage}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Generate a presigned URL for downloading an object from S3
   * @param key - The S3 object key
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Presigned URL or direct LocalStack URL
   * @throws BadRequestException if key is invalid
   * @throws InternalServerErrorException if URL generation fails
   */
  async getSignedUrl(
    key: string,
    expiresIn: number = DEFAULT_PRESIGNED_URL_EXPIRY,
  ): Promise<string> {
    if (!key?.trim()) {
      throw new BadRequestException('S3 key is required');
    }

    if (expiresIn <= 0 || expiresIn > 604800) {
      // Max 7 days (AWS limit)
      throw new BadRequestException(
        'Expiration time must be between 1 and 604800 seconds',
      );
    }

    try {
      // For LocalStack, construct direct URL instead of presigned URL
      if (this.endpointUrl) {
        const endpoint = this.endpointUrl.replace(/\/$/, '');
        return `${endpoint}/${this.bucketName}/${key.trim()}`;
      }

      // For AWS, use presigned URLs
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key.trim(),
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      const errorMessage = `Failed to generate presigned URL for key "${key}" in bucket "${this.bucketName}"`;
      this.logger.error(`${errorMessage}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Upload a file to S3
   * @param recResourceId - Recreation resource ID
   * @param file - File buffer
   * @param filename - Filename including extension
   * @returns S3 key of uploaded file
   * @throws BadRequestException if parameters are invalid or file already exists
   * @throws InternalServerErrorException if upload fails
   */
  async uploadFile(
    recResourceId: string,
    file: Buffer,
    filename: string,
  ): Promise<string> {
    if (!recResourceId?.trim()) {
      throw new BadRequestException('Recreation resource ID is required');
    }
    if (!file || file.length === 0) {
      throw FileValidationException.fileBufferEmpty();
    }
    if (!filename?.trim()) {
      throw FileValidationException.fileNameRequired();
    }

    const key = `${recResourceId.trim()}/${filename.trim()}`;

    try {
      // Check if file already exists
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      // If file exists - throw error
      const errorMessage = `File "${filename}" already exists in bucket "${this.bucketName}"`;
      this.logger.warn(`${errorMessage} - Key: ${key}`);
      throw new BadRequestException(errorMessage);
    } catch (error) {
      // If file doesn't exist (404), proceed with upload
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        try {
          this.logger.debug(
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
        } catch (uploadError) {
          const errorMessage = `Failed to upload file "${filename}" to bucket "${this.bucketName}"`;
          this.logger.error(
            `${errorMessage}: ${uploadError.message}`,
            uploadError.stack,
          );
          throw new InternalServerErrorException(errorMessage);
        }
      }

      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Other errors
      const errorMessage = `Failed to check file existence for "${filename}" in bucket "${this.bucketName}"`;
      this.logger.error(`${errorMessage}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Delete a file from S3
   * @param key - S3 object key
   * @throws BadRequestException if key is invalid
   * @throws InternalServerErrorException if deletion fails
   */
  async deleteFile(key: string): Promise<void> {
    if (!key?.trim()) {
      throw new BadRequestException('S3 key is required');
    }

    try {
      this.logger.debug(`Deleting file from S3 - Key: ${key}`);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key.trim(),
        }),
      );

      this.logger.log(`File deleted successfully from S3 - Key: ${key}`);
    } catch (error) {
      const errorMessage = `Failed to delete file with key "${key}" from bucket "${this.bucketName}"`;
      this.logger.error(`${errorMessage}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
