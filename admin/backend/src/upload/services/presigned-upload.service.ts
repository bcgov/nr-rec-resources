import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

export interface PresignedUploadResponse {
  uploadUrl: string;
  uploadId: string;
  maxFileSize: number;
  expiresIn: number;
  key: string;
}

export interface S3FileInfo {
  buffer: Buffer;
  size: number;
  key: string;
}

/**
 * PresignedUploadService - Focused solely on S3 operations
 *
 * Responsibilities:
 * - Generate presigned S3 upload URLs
 * - Download files from S3
 * - Clean up S3 files
 * - S3-related utilities
 *
 * Does NOT handle:
 * - DAM API operations (belongs in domain services)
 * - Database operations (belongs in domain services)
 * - Business logic orchestration (belongs in domain services)
 */
@Injectable()
export class PresignedUploadService {
  private readonly logger = new Logger(PresignedUploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>("S3_UPLOAD_BUCKET") ||
      "nr-rec-resources-admin-file-uploads-dev";
    this.s3Client = new S3Client();
  }

  /**
   * Generate a presigned URL for direct S3 upload
   */
  async generatePresignedUploadUrl(
    recResourceId: string,
    fileName: string,
    fileSize: number,
    contentType: string = "application/pdf",
  ): Promise<PresignedUploadResponse> {
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    if (fileSize > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`,
      );
    }

    const uploadId = uuidv4();
    const key = `uploads/${recResourceId}/${uploadId}/${fileName}`;
    const expiresIn = 3600; // 1 hour

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ContentLength: fileSize,
        Metadata: {
          "rec-resource-id": recResourceId,
          "upload-id": uploadId,
          "original-filename": fileName,
        },
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(
        `Generated presigned URL for ${fileName} (${fileSize} bytes) - Upload ID: ${uploadId}`,
      );

      return {
        uploadUrl,
        uploadId,
        maxFileSize,
        expiresIn,
        key,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned URL: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to generate upload URL");
    }
  }

  /**
   * Download file from S3 and return file information
   * This method only handles S3 operations - domain services handle the rest
   */
  async downloadFileFromS3(
    recResourceId: string,
    uploadId: string,
    originalFileName: string,
  ): Promise<S3FileInfo> {
    const key = `uploads/${recResourceId}/${uploadId}/${originalFileName}`;

    this.logger.log(`Downloading file from S3: ${key}`);

    try {
      const buffer = await this.downloadFromS3(key);

      return {
        buffer,
        size: buffer.length,
        key,
      };
    } catch (error) {
      this.logger.error(
        `Failed to download file from S3: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to retrieve uploaded file");
    }
  }

  /**
   * Clean up file from S3 after successful processing
   */
  async cleanupS3File(key: string): Promise<void> {
    await this.deleteFromS3(key);
  }

  /**
   * Download file from S3 to convert to Express.Multer.File format
   */
  private async downloadFromS3(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error("No file content received from S3");
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as NodeJS.ReadableStream;

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(
        `Failed to download file from S3: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to retrieve uploaded file");
    }
  }

  /**
   * Clean up the temporary file from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted temporary file: ${key}`);
    } catch (error) {
      // Don't fail the request if cleanup fails, just log the error
      this.logger.error(
        `Failed to clean up temporary file ${key}: ${error.message}`,
        error.stack,
      );
    }
  }
}
