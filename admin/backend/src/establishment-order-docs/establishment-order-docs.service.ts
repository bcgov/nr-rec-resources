import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3';
import { EstablishmentOrderDocDto } from './dto/establishment-order-doc.dto';

@Injectable()
export class EstablishmentOrderDocsService {
  private readonly logger = new Logger(EstablishmentOrderDocsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

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
}
