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
import { Prisma } from '@generated/prisma';

interface ExhibitADocRow {
  doc_id: string;
  rec_resource_id: string;
  application_guid: string | null;
  file_name: string;
  extension: string;
  file_size: bigint | null;
  s3_key: string;
  generation_method: 'upload' | 'regenerate' | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Explicit projection so runtime does not depend on stale generated Prisma model fields.
const DOC_COLUMNS = Prisma.sql`
  doc_id, rec_resource_id, application_guid, file_name, extension,
  file_size, s3_key, generation_method, created_at, updated_at
`;

const PRESIGN_EXPIRY_SECONDS = 900;

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
    const { exhibitADocsBucket: bucket, awsEndpointUrl: endpoint } =
      this.appConfig;

    return {
      bucketName: bucket,
      cloudfrontUrl: endpoint ? `${endpoint}/${bucket}` : undefined,
      endpointUrl: endpoint,
    };
  }

  async getAll(rec_resource_id: string): Promise<ExhibitADocDto[]> {
    const docs = await this.prisma.$queryRaw<ExhibitADocRow[]>`
      SELECT ${DOC_COLUMNS}
      FROM rst.recreation_exhibit_a_doc
      WHERE rec_resource_id = ${rec_resource_id}
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    `;

    return Promise.all(
      docs.map(async (doc) =>
        this.mapResponse(doc, await this.s3Service.getSignedUrl(doc.s3_key)),
      ),
    );
  }

  // `_file_name` is unused (the key is canonical) but kept for controller compatibility.
  async presignUpload(
    rec_resource_id: string,
    _file_name: string,
  ): Promise<PresignExhibitAUploadResponseDto> {
    await this.validateResourceExists(rec_resource_id);

    const document_id = randomUUID();
    const key = this.buildS3Key(rec_resource_id, document_id);
    const url = await this.generatePresignedUrl(
      key,
      'application/pdf',
      PRESIGN_EXPIRY_SECONDS,
    );

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

    const applicationGuid = await this.resolveApplicationGuid(body);
    const s3_key = this.buildS3Key(rec_resource_id, body.document_id);

    let doc: ExhibitADocRow | undefined;
    try {
      [doc] = await this.prisma.$queryRaw<ExhibitADocRow[]>`
      INSERT INTO rst.recreation_exhibit_a_doc (
        doc_id, rec_resource_id, file_name, extension, file_size,
        s3_key, application_guid, generation_method, created_at
      )
      VALUES (
        ${body.document_id}::uuid,
        ${rec_resource_id},
        ${this.normalizeStem(body.file_name)},
        ${this.normalizeExtension(body.extension)},
        ${BigInt(body.file_size)},
        ${s3_key},
        ${applicationGuid}::uuid,
        'upload',
        CURRENT_TIMESTAMP
      )
      RETURNING ${DOC_COLUMNS}
    `;
    } catch (error) {
      this.handleError(
        error,
        `Failed to finalize Exhibit A upload for rec_resource_id: ${rec_resource_id}, document_id: ${body.document_id}`,
        'Failed to finalize upload',
      );
    }

    if (!doc) {
      throw new HttpException('Failed to finalize upload', 500);
    }

    const url = await this.s3Service.getSignedUrl(doc.s3_key);

    this.logger.log(
      `Finalized Exhibit A upload: rec_resource_id=${rec_resource_id}, document_id=${body.document_id}`,
    );

    return this.mapResponse(doc, url);
  }

  async delete(
    rec_resource_id: string,
    document_id: string,
  ): Promise<ExhibitADocDto> {
    // Scoping by both ids replaces the separate select + ownership check.
    const [doc] = await this.prisma.$queryRaw<ExhibitADocRow[]>`
      DELETE FROM rst.recreation_exhibit_a_doc
      WHERE doc_id = ${document_id}::uuid
        AND rec_resource_id = ${rec_resource_id}
        RETURNING ${DOC_COLUMNS}
    `;

    if (!doc) {
      throw new HttpException('Exhibit A document not found', 404);
    }

    await this.deleteS3FileSafely(doc.s3_key);

    this.logger.log(
      `Deleted Exhibit A doc: rec_resource_id=${rec_resource_id}, document_id=${document_id}`,
    );

    return this.mapResponse(doc, '');
  }

  private buildS3Key(rec_resource_id: string, document_id: string): string {
    return `${rec_resource_id}/${document_id}/exhibit-a-${document_id}.pdf`;
  }

  /** Lowercases, drops the extension, and reduces to [a-z0-9_-] with single dashes. */
  private normalizeStem(rawStem: string): string {
    return (
      (rawStem ?? '')
        .trim()
        .toLowerCase()
        .replace(/(?<!^)\.[^.]*$/, '') // strip extension (not for leading-dot names)
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'exhibit-a'
    );
  }

  private normalizeExtension(rawExtension: string): string {
    return (
      (rawExtension ?? '').trim().replace(/^\.+/, '').toLowerCase() || 'pdf'
    );
  }

  private async resolveApplicationGuid(
    body: FinalizeExhibitAUploadRequestDto,
  ): Promise<string | null> {
    if (body.application_guid) return body.application_guid;
    if (!body.submission_id) return null;

    const [row] = await this.prisma.$queryRaw<{ application_guid: string }[]>`
      SELECT application_guid::text AS application_guid
      FROM rst.recreation_spatial_submission
      WHERE submission_id = ${body.submission_id}
        LIMIT 1
    `;

    if (!row?.application_guid) {
      throw new HttpException(
        `Spatial submission not found for submission_id: ${body.submission_id}`,
        404,
      );
    }

    return row.application_guid;
  }

  private mapResponse(doc: ExhibitADocRow, url: string): ExhibitADocDto {
    return {
      document_id: doc.doc_id,
      rec_resource_id: doc.rec_resource_id,
      application_guid: doc.application_guid ?? null,
      submission_id: null,
      file_name: doc.file_name,
      extension: doc.extension,
      file_size: doc.file_size ? Number(doc.file_size) : undefined,
      s3_key: doc.s3_key,
      generation_method: doc.generation_method ?? null,
      url,
      created_at: doc.created_at ?? undefined,
    };
  }
}
