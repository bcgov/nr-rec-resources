import { AppConfigService } from '@/app-config/app-config.service';
import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { extractFileMetadata } from '@/common/utils/file.utils';
import { HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { RecreationResourceDocDto } from '../dto/recreation-resource-doc.dto';

// Common select fields for document queries
const DOCUMENT_SELECT_FIELDS = {
  doc_code: true,
  rec_resource_id: true,
  doc_id: true,
  file_name: true,
  extension: true,
  created_at: true,
  recreation_resource_doc_code: {
    select: {
      description: true,
    },
  },
} as const;

@Injectable()
export class ResourceDocsService extends BaseStorageFileService {
  constructor(
    prisma: PrismaService,
    appConfig: AppConfigService,
    private readonly s3Service: S3Service,
  ) {
    super(ResourceDocsService.name, prisma, appConfig);
  }

  /**
   * Get storage configuration for resource documents
   */
  protected getStorageConfig(): StorageConfig {
    return {
      bucketName: this.appConfig.recResourcePublicDocsBucket,
      cloudfrontUrl: this.appConfig.recResourceStorageCloudfrontUrl,
      endpointUrl: this.appConfig.awsEndpointUrl,
    };
  }

  async getAll(
    rec_resource_id: string,
  ): Promise<RecreationResourceDocDto[] | null> {
    const result = await this.prisma.recreation_resource_document.findMany({
      where: { rec_resource_id },
      orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
      select: DOCUMENT_SELECT_FIELDS,
    });
    return result.map((i) => this.mapResponse(i, rec_resource_id));
  }

  async getDocumentByResourceId(
    rec_resource_id: string,
    document_id: string,
  ): Promise<RecreationResourceDocDto> {
    const result = await this.prisma.recreation_resource_document.findUnique({
      where: { rec_resource_id, doc_id: document_id },
      select: DOCUMENT_SELECT_FIELDS,
    });

    if (!result) {
      throw new HttpException('Recreation Resource document not found', 404);
    }

    return this.mapResponse(result, rec_resource_id);
  }

  async create(
    rec_resource_id: string,
    file_name: string,
    file: Express.Multer.File,
  ): Promise<RecreationResourceDocDto> {
    // File validation is handled by ParseFilePipe at controller level
    if (!file_name) {
      throw FileValidationException.fileNameRequired();
    }
    // Validate resource exists
    await this.validateResourceExists(rec_resource_id);

    try {
      const document_id = randomUUID();
      // Extract extension from file metadata, but use provided filename
      const { extension } = extractFileMetadata(file);
      const filename = file_name;

      const s3Filename = `${filename}.${extension}`;
      const s3Key = await this.s3Service.uploadFile(
        `documents/${rec_resource_id}/${document_id}`,
        file.buffer,
        s3Filename,
      );

      this.logger.log(
        `Successfully uploaded document to S3 for rec_resource_id: ${rec_resource_id}, document_id: ${document_id}, s3_key: ${s3Key}`,
      );

      await this.prisma.recreation_resource_document.create({
        data: {
          doc_id: document_id,
          rec_resource_id,
          doc_code: 'RM', // Default doc_code - TODO: should come from request
          file_name: filename,
          extension,
          file_size: BigInt(file.size),
          created_by: 'system',
          created_at: new Date(),
        },
      });

      // Fetch the created document with relations for response mapping
      const result = await this.prisma.recreation_resource_document.findUnique({
        where: {
          rec_resource_id,
          doc_id: document_id,
        },
        select: DOCUMENT_SELECT_FIELDS,
      });

      if (!result) {
        throw new HttpException('Failed to retrieve created document', 500);
      }

      return this.mapResponse(result, rec_resource_id);
    } catch (error) {
      this.handleError(
        error,
        `Failed to create document for rec_resource_id: ${rec_resource_id}`,
        'Failed to upload document',
      );
    }
  }

  async delete(
    rec_resource_id: string,
    document_id: string,
  ): Promise<RecreationResourceDocDto> {
    const doc = await this.prisma.recreation_resource_document.findUnique({
      where: { rec_resource_id, doc_id: document_id },
      select: DOCUMENT_SELECT_FIELDS,
    });

    if (!doc) {
      throw new HttpException('Recreation Resource document not found', 404);
    }

    if (!doc.file_name || !doc.extension) {
      throw new HttpException(
        'Document metadata is incomplete: missing file_name or extension',
        500,
      );
    }

    try {
      await this.prisma.recreation_resource_document.delete({
        where: { rec_resource_id, doc_id: document_id },
      });

      const s3Key = `documents/${rec_resource_id}/${document_id}/${doc.file_name}.${doc.extension}`;
      await this.deleteS3FileSafely(s3Key);

      return this.mapResponse(doc, rec_resource_id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleError(
        error,
        `Failed to delete document for rec_resource_id: ${rec_resource_id}, document_id: ${document_id}`,
        'Failed to delete document',
      );
    }
  }

  private mapResponse(payload: any, rec_resource_id: string) {
    const extension = payload.extension || 'pdf';
    const fileName = payload.file_name || 'document';
    const s3Key = `documents/${rec_resource_id}/${payload.doc_id}/${fileName}.${extension}`;
    return {
      document_id: payload.doc_id,
      file_name: payload.file_name || null,
      rec_resource_id: payload.rec_resource_id || rec_resource_id,
      url: this.constructDocUrl(s3Key),
      doc_code: payload.doc_code || null,
      doc_code_description:
        payload.recreation_resource_doc_code?.description || null,
      extension: payload.extension || null,
      created_at: payload.created_at?.toISOString() || null,
    };
  }

  private constructDocUrl(s3Key: string): string {
    return this.getPublicUrl(s3Key);
  }

  private async deleteS3FileSafely(s3Key: string): Promise<void> {
    try {
      await this.s3Service.deleteFile(s3Key);
      this.logger.log(`Successfully deleted document from S3: ${s3Key}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete document from S3: ${s3Key}`,
        error.stack,
      );
    }
  }
}
