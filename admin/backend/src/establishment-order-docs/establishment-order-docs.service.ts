import { AppConfigService } from '@/app-config/app-config.service';
import { BaseStorageFileService } from '@/common/services/base-storage-file-service';
import { extractFileMetadata } from '@/common/utils/file.utils';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3/s3.service';
import { HttpException, Injectable } from '@nestjs/common';
import { EstablishmentOrderDocDto } from './dto/establishment-order-doc.dto';

@Injectable()
export class EstablishmentOrderDocsService extends BaseStorageFileService {
  constructor(
    prisma: PrismaService,
    appConfig: AppConfigService,
    private readonly s3Service: S3Service,
  ) {
    super(EstablishmentOrderDocsService.name, prisma, appConfig);
  }

  /**
   * Get all establishment order documents for a recreation resource
   * Fetches metadata from database and generates presigned URLs
   * @param rec_resource_id - Recreation Resource ID
   * @returns Array of establishment order documents with presigned URLs
   */
  async getAll(rec_resource_id: string): Promise<EstablishmentOrderDocDto[]> {
    this.logger.log(
      `Fetching establishment order docs for rec_resource_id: ${rec_resource_id}`,
    );

    // Fetch all documents from database
    const docs = await this.prisma.recreation_establishment_order_docs.findMany(
      {
        where: {
          rec_resource_id,
        },
        select: {
          s3_key: true,
          rec_resource_id: true,
          title: true,
          file_size: true,
          extension: true,
          created_at: true,
        },
      },
    );

    // Generate presigned URLs for each document
    const docsWithUrls = await Promise.all(
      docs.map(async (doc) => {
        const url = await this.s3Service.getSignedUrl(doc.s3_key);
        return {
          s3_key: doc.s3_key,
          rec_resource_id: doc.rec_resource_id!,
          title: doc.title || '',
          file_size: doc.file_size ? Number(doc.file_size) : 0,
          extension: doc.extension || '',
          url,
          created_at: doc.created_at || undefined,
        };
      }),
    );

    return docsWithUrls;
  }

  /**
   * Create a new establishment order document
   * Uploads file to S3 and saves metadata to database
   * @param rec_resource_id - Recreation Resource ID
   * @param title - Document title
   * @param file - Uploaded file
   * @returns Created establishment order document with presigned URL
   */
  async create(
    rec_resource_id: string,
    title: string,
    file: Express.Multer.File,
  ): Promise<EstablishmentOrderDocDto> {
    // File validation is handled by ParseFilePipe at controller level

    // Verify recreation resource exists
    await this.validateResourceExists(rec_resource_id);

    this.logger.log(
      `Creating establishment order doc for rec_resource_id: ${rec_resource_id}, title: ${title}`,
    );

    // Extract file metadata using utility function
    const { extension } = extractFileMetadata(file);
    const filename = `${title}.${extension}`;
    const s3_key = await this.s3Service.uploadFile(
      rec_resource_id,
      file.buffer,
      filename,
    );

    // Save metadata to database
    const doc = await this.prisma.recreation_establishment_order_docs.create({
      data: {
        s3_key,
        rec_resource_id,
        title,
        file_size: BigInt(file.size),
        extension,
      },
    });

    // Generate presigned URL
    const url = await this.s3Service.getSignedUrl(s3_key);

    this.logger.log(
      `Establishment order doc created successfully - s3_key: ${s3_key}`,
    );

    return {
      s3_key: doc.s3_key,
      rec_resource_id: doc.rec_resource_id!,
      title: doc.title || '',
      file_size: doc.file_size ? Number(doc.file_size) : 0,
      extension: doc.extension || '',
      url,
      created_at: doc.created_at || undefined,
    };
  }

  /**
   * Delete an establishment order document
   * Deletes file from S3 and removes metadata from database
   * @param rec_resource_id - Recreation Resource ID
   * @param s3_key - S3 object key to delete
   * @returns Deleted establishment order document
   */
  async delete(
    rec_resource_id: string,
    s3_key: string,
  ): Promise<EstablishmentOrderDocDto> {
    this.logger.log(
      `Deleting establishment order doc - rec_resource_id: ${rec_resource_id}, s3_key: ${s3_key}`,
    );

    // Verify the document exists
    const existingDoc =
      await this.prisma.recreation_establishment_order_docs.findUnique({
        where: { s3_key },
      });

    if (!existingDoc) {
      this.logger.error(`Document not found - s3_key: ${s3_key}`);
      throw new HttpException('Document not found', 404);
    }

    // Delete from database first
    const doc = await this.prisma.recreation_establishment_order_docs.delete({
      where: {
        s3_key,
      },
    });

    // Delete from S3
    await this.s3Service.deleteFile(s3_key);

    this.logger.log(
      `Establishment order doc deleted successfully - s3_key: ${s3_key}`,
    );

    return {
      s3_key: doc.s3_key,
      rec_resource_id: doc.rec_resource_id!,
      title: doc.title || '',
      file_size: doc.file_size ? Number(doc.file_size) : 0,
      extension: doc.extension || '',
      url: '',
      created_at: doc.created_at || undefined,
    };
  }
}
