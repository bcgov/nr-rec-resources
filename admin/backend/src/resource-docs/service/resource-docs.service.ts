import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
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
    s3Service: S3Service,
  ) {
    super(ResourceDocsService.name, prisma, appConfig, s3Service);
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
      select: DOCUMENT_SELECT_FIELDS,
      where: { rec_resource_id, doc_code: 'RM' },
      orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
    });
    return result.map((i) => this.mapResponse(i, rec_resource_id));
  }

  /**
   * Delete document from datatabase and S3
   * @param rec_resource_id - Recreation resource ID
   * @param document_id - document ID
   * @param soft_delete - if set to true keeps the image on S3
   */
  async delete(
    rec_resource_id: string,
    document_id: string,
    soft_delete: boolean = true,
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

      if (!soft_delete) {
        const s3Key = `documents/${rec_resource_id}/${document_id}/${doc.file_name}.${doc.extension}`;
        await this.deleteS3FileSafely(s3Key);
      }

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

  /**
   * Generate presigned upload URL for document
   * Called before client uploads file to S3
   */
  async presignUpload(rec_resource_id: string, file_name: string) {
    // Validate resource exists
    await this.validateResourceExists(rec_resource_id);

    const document_id = randomUUID();

    try {
      const key = `documents/${rec_resource_id}/${document_id}/${file_name}`;

      const url = await this.generatePresignedUrl(
        key,
        'application/pdf',
        900, // 15 minutes
      );

      this.logger.log(
        `Generated presigned upload URL for document: rec_resource_id=${rec_resource_id}, document_id=${document_id}`,
      );

      return {
        document_id,
        key,
        url,
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to generate presigned URL for rec_resource_id: ${rec_resource_id}`,
        'Failed to generate presigned URL',
      );
    }
  }

  /**
   * Finalize document upload by creating database record
   * Called after S3 upload completes successfully
   * No S3 verification is performed
   */
  async finalizeUpload(
    rec_resource_id: string,
    { document_id, file_name, extension, file_size, doc_code = 'RM' }: any,
  ): Promise<RecreationResourceDocDto> {
    // Validate resource exists
    await this.validateResourceExists(rec_resource_id);

    // Validate document_id format (basic UUID validation)
    this.validateEntityId(document_id, 'document_id');

    try {
      await this.prisma.recreation_resource_document.create({
        data: {
          doc_id: document_id,
          rec_resource_id,
          doc_code,
          file_name,
          extension,
          file_size: BigInt(file_size),
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

      this.logger.log(
        `Finalized document upload: rec_resource_id=${rec_resource_id}, document_id=${document_id}`,
      );

      return this.mapResponse(result, rec_resource_id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleError(
        error,
        `Failed to finalize document upload for rec_resource_id: ${rec_resource_id}, document_id: ${document_id}`,
        'Failed to finalize upload',
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
