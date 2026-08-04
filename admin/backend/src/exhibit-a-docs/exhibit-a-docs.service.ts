import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import {
  ExhibitADocDto,
  FinalizeExhibitAUploadRequestDto,
  PresignExhibitAUploadResponseDto,
} from './dto/exhibit-a-doc.dto';

@Injectable()
export class ExhibitADocsService extends BaseStorageFileService {
  constructor(
    prisma: PrismaService,
    appConfig: AppConfigService,
    s3Service: S3Service,
  ) {
    super(ExhibitADocsService.name, prisma, appConfig, s3Service);
  }

  protected getStorageConfig(): StorageConfig {
    return {
      bucketName: this.appConfig.exhibitADocsBucket,
      cloudfrontUrl: this.appConfig.awsEndpointUrl
        ? `${this.appConfig.awsEndpointUrl}/${this.appConfig.exhibitADocsBucket}`
        : undefined,
      endpointUrl: this.appConfig.awsEndpointUrl,
    };
  }

  async getAll(rec_resource_id: string): Promise<ExhibitADocDto[]> {
    const docs = await this.prisma.recreation_exhibit_a_doc.findMany({
      where: { rec_resource_id },
      orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
    });

    return Promise.all(
      docs.map(async (doc) => {
        const url = await this.s3Service.getSignedUrl(doc.s3_key);
        return this.mapResponse(doc, url);
      }),
    );
  }

  async presignUpload(
    rec_resource_id: string,
    file_name: string,
  ): Promise<PresignExhibitAUploadResponseDto> {
    await this.validateResourceExists(rec_resource_id);

    const document_id = randomUUID();
    const key = `${rec_resource_id}/${document_id}/${file_name}`;

    const url = await this.generatePresignedUrl(key, 'application/pdf', 900);

    this.logger.log(
      `Generated presigned upload URL for Exhibit A doc: rec_resource_id=${rec_resource_id}, document_id=${document_id}`,
    );

    return { document_id, key, url };
  }

  async finalizeUpload(
    rec_resource_id: string,
    body: FinalizeExhibitAUploadRequestDto,
  ): Promise<ExhibitADocDto> {
    await this.validateResourceExists(rec_resource_id);
    this.validateEntityId(body.document_id, 'document_id');

    const s3_key = `${rec_resource_id}/${body.document_id}/${body.file_name}.${body.extension}`;

    try {
      const doc = await this.prisma.recreation_exhibit_a_doc.create({
        data: {
          doc_id: body.document_id,
          rec_resource_id,
          file_name: body.file_name,
          extension: body.extension,
          file_size: BigInt(body.file_size),
          s3_key,
          created_at: new Date(),
        },
      });

      const url = await this.s3Service.getSignedUrl(doc.s3_key);

      this.logger.log(
        `Finalized Exhibit A upload: rec_resource_id=${rec_resource_id}, document_id=${body.document_id}`,
      );

      return this.mapResponse(doc, url);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.handleError(
        error,
        `Failed to finalize Exhibit A upload for rec_resource_id: ${rec_resource_id}, document_id: ${body.document_id}`,
        'Failed to finalize upload',
      );
    }
  }

  async delete(
    rec_resource_id: string,
    document_id: string,
  ): Promise<ExhibitADocDto> {
    const doc = await this.prisma.recreation_exhibit_a_doc.findUnique({
      where: { doc_id: document_id },
    });

    if (!doc || doc.rec_resource_id !== rec_resource_id) {
      throw new HttpException('Exhibit A document not found', 404);
    }

    await this.prisma.recreation_exhibit_a_doc.delete({
      where: { doc_id: document_id },
    });

    await this.deleteS3FileSafely(doc.s3_key);

    this.logger.log(
      `Deleted Exhibit A doc: rec_resource_id=${rec_resource_id}, document_id=${document_id}`,
    );

    return this.mapResponse(doc, '');
  }

  private mapResponse(doc: any, url: string): ExhibitADocDto {
    return {
      document_id: doc.doc_id,
      rec_resource_id: doc.rec_resource_id,
      file_name: doc.file_name,
      extension: doc.extension,
      file_size: doc.file_size ? Number(doc.file_size) : undefined,
      s3_key: doc.s3_key,
      url,
      created_at: doc.created_at ?? undefined,
    };
  }
}
