import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { RecreationResourceImageDto } from '../dto/recreation-resource-image.dto';
import { RecreationResourceImageSize } from '@shared/constants/images';
import { ConsentFormsS3Service } from './consent-forms-s3.service';
import { RecResourceImagesS3Service } from './rec-resource-images-s3.service';

const REQUIRED_VARIANTS = ['original', 'scr', 'pre', 'thm'] as const;
type ImageVariantType = (typeof REQUIRED_VARIANTS)[number];

interface ImageVariantFiles {
  original: Express.Multer.File;
  scr: Express.Multer.File;
  pre: Express.Multer.File;
  thm: Express.Multer.File;
}

export interface ConsentMetadata {
  date_taken?: string;
  contains_pii?: boolean;
  photographer_type?: string;
  photographer_name?: string;
}

@Injectable()
export class ResourceImagesService extends BaseStorageFileService {
  constructor(
    prisma: PrismaService,
    appConfig: AppConfigService,
    private readonly s3Service: RecResourceImagesS3Service,
    private readonly consentFormsS3Service: ConsentFormsS3Service,
  ) {
    super(ResourceImagesService.name, prisma, appConfig);
  }

  protected getStorageConfig(): StorageConfig {
    return {
      bucketName: this.appConfig.recResourceImagesBucket,
      cloudfrontUrl: this.appConfig.recResourceStorageCloudfrontUrl,
      endpointUrl: this.appConfig.awsEndpointUrl,
    };
  }

  async getAll(
    rec_resource_id: string,
  ): Promise<RecreationResourceImageDto[] | null> {
    const result = await this.prisma.recreation_resource_image.findMany({
      where: {
        rec_resource_id,
      },
      orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
      select: {
        rec_resource_id: true,
        image_id: true,
        file_name: true,
        extension: true,
        file_size: true,
        created_at: true,
      },
    });
    return result.map((i) => this.mapResponse(i));
  }

  async getImageByResourceId(
    rec_resource_id: string,
    image_id: string,
  ): Promise<RecreationResourceImageDto> {
    const result = await this.prisma.recreation_resource_image.findUnique({
      where: {
        rec_resource_id,
        image_id,
      },
      select: {
        rec_resource_id: true,
        image_id: true,
        file_name: true,
        extension: true,
        file_size: true,
        created_at: true,
      },
    });

    if (result === null) {
      throw new HttpException('Recreation Resource image not found', 404);
    }

    return this.mapResponse(result);
  }

  async create(
    rec_resource_id: string,
    file_name: string,
    variantFiles: ImageVariantFiles,
    consentMetadata?: ConsentMetadata,
    consentFormFile?: Express.Multer.File | null,
  ): Promise<RecreationResourceImageDto> {
    await this.validateResourceExists(rec_resource_id);

    const image_id = randomUUID();
    const doc_id = consentFormFile ? randomUUID() : null;
    const cleanupActions: (() => Promise<void>)[] = [];

    try {
      // Phase 1: S3 Uploads
      await this.prepareAndUploadImages(
        rec_resource_id,
        image_id,
        file_name,
        variantFiles,
      );
      cleanupActions.push(() =>
        this.s3Service.deleteImageVariants(rec_resource_id, image_id),
      );

      const consentFileName =
        consentFormFile?.originalname || `consent_${image_id}.pdf`;
      const consentFormUploaded =
        consentFormFile && consentMetadata?.contains_pii && doc_id;

      if (consentFormUploaded) {
        await this.uploadConsentForm(
          rec_resource_id,
          image_id,
          doc_id,
          consentFormFile,
          consentFileName,
        );
        cleanupActions.push(() =>
          this.consentFormsS3Service.deleteConsentForm(
            rec_resource_id,
            image_id,
            doc_id,
          ),
        );
      }

      // Phase 2: Database Transaction
      const result = await this.createDatabaseRecords({
        image_id,
        doc_id,
        rec_resource_id,
        file_name,
        variantFiles,
        consentFormFile: consentFormFile ?? undefined,
        consentMetadata,
        consentFormUploaded: !!consentFormUploaded,
        consentFileName: consentFormUploaded ? consentFileName : null,
      });

      return this.mapResponse(result);
    } catch (error) {
      this.logger.error(
        `Error during image creation, running cleanup for image_id: ${image_id}`,
      );
      for (const cleanup of cleanupActions) {
        try {
          await cleanup();
        } catch (cleanupError) {
          this.logger.error(`Cleanup action failed: ${cleanupError}`);
        }
      }
      this.handleError(
        error,
        `Failed to create image for rec_resource_id: ${rec_resource_id}`,
        'Failed to upload image',
      );
    }
  }

  private async prepareAndUploadImages(
    rec_resource_id: string,
    image_id: string,
    file_name: string,
    variantFiles: ImageVariantFiles,
  ): Promise<void> {
    const variants = REQUIRED_VARIANTS.map((sizeCode) => ({
      sizeCode,
      buffer: variantFiles[sizeCode].buffer,
      metadata: sizeCode === 'original' ? { filename: file_name } : undefined,
    }));

    await this.s3Service.uploadImageVariants(
      rec_resource_id,
      image_id,
      variants,
    );
    this.logger.log(
      `Successfully uploaded ${variants.length} image variants to S3 for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
    );
  }

  private async uploadConsentForm(
    rec_resource_id: string,
    image_id: string,
    doc_id: string,
    consentFormFile: Express.Multer.File,
    consentFileName: string,
  ): Promise<void> {
    await this.consentFormsS3Service.uploadConsentForm(
      rec_resource_id,
      image_id,
      doc_id,
      consentFormFile.buffer,
      consentFileName,
    );
    this.logger.log(
      `Successfully uploaded consent form to S3 for image_id: ${image_id}`,
    );
  }

  private async createDatabaseRecords(params: {
    image_id: string;
    doc_id: string | null;
    rec_resource_id: string;
    file_name: string;
    variantFiles: ImageVariantFiles;
    consentFormFile?: Express.Multer.File;
    consentMetadata?: ConsentMetadata;
    consentFormUploaded: boolean;
    consentFileName: string | null;
  }) {
    const {
      image_id,
      doc_id,
      rec_resource_id,
      file_name,
      variantFiles,
      consentFormFile,
      consentMetadata,
      consentFormUploaded,
      consentFileName,
    } = params;

    return this.prisma.$transaction(async (tx) => {
      const imageRecord = await tx.recreation_resource_image.create({
        data: {
          image_id,
          rec_resource_id,
          file_name,
          extension: 'webp',
          file_size: BigInt(variantFiles.original.size),
          created_by: 'system',
          created_at: new Date(),
        },
      });

      if (consentFormUploaded && doc_id && consentFileName && consentFormFile) {
        await tx.recreation_resource_document.create({
          data: {
            doc_id,
            rec_resource_id,
            doc_code: 'IC',
            file_name: consentFileName,
            extension: 'pdf',
            file_size: BigInt(consentFormFile.size),
            created_by: 'system',
            created_at: new Date(),
          },
        });

        await tx.recreation_image_consent_form.create({
          data: {
            consent_id: randomUUID(),
            image_id,
            doc_id,
            photographer_type_code:
              consentMetadata?.photographer_type ?? 'STAFF',
            photographer_name: consentMetadata?.photographer_name,
            date_taken: consentMetadata?.date_taken
              ? new Date(consentMetadata.date_taken)
              : null,
            contains_pii: consentMetadata?.contains_pii ?? false,
            created_by: 'system',
            created_at: new Date(),
          },
        });
      }

      this.logger.log(
        `Created image ${image_id}${consentFormUploaded ? ' with consent form' : ''} for resource ${rec_resource_id}`,
      );

      return imageRecord;
    });
  }

  async delete(
    rec_resource_id: string,
    image_id: string,
  ): Promise<RecreationResourceImageDto | null> {
    // Check if resource exists
    const resource = await this.prisma.recreation_resource_image.findUnique({
      where: {
        rec_resource_id,
        image_id,
      },
    });

    if (resource === null) {
      throw new HttpException('Recreation Resource image not found', 404);
    }

    try {
      // NOTE: S3 files are intentionally NOT deleted for audit purposes

      const result = await this.prisma.$transaction(async (tx) => {
        // Check for associated consent form
        const consentForm = await tx.recreation_image_consent_form.findUnique({
          where: { image_id },
        });

        // Delete consent-related records first (foreign key constraints)
        if (consentForm) {
          await tx.recreation_image_consent_form.delete({
            where: { image_id },
          });
          await tx.recreation_resource_document.delete({
            where: { doc_id: consentForm.doc_id },
          });
        }

        const deleted = await tx.recreation_resource_image.delete({
          where: { rec_resource_id, image_id },
        });

        return { deleted, hadConsentForm: !!consentForm };
      });

      this.logger.log(
        `Deleted image ${image_id}${result.hadConsentForm ? ' with consent form' : ''} for resource ${rec_resource_id}`,
      );
      return this.mapResponse(result.deleted);
    } catch (error) {
      this.handleError(
        error,
        `Failed to delete image for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
        'Failed to delete image',
      );
    }
  }

  private constructS3Path(
    rec_resource_id: string,
    image_id: string,
    sizeCode: string,
  ): string {
    return `images/${rec_resource_id}/${image_id}/${sizeCode}.webp`;
  }

  private constructImageUrl(
    rec_resource_id: string,
    image_id: string,
    variant: string,
  ): string {
    const key = this.constructS3Path(rec_resource_id, image_id, variant);
    return this.getPublicUrl(key);
  }

  private mapResponse(payload: any): RecreationResourceImageDto {
    const sizeCodeMap: Record<ImageVariantType, RecreationResourceImageSize> = {
      original: RecreationResourceImageSize.ORIGINAL,
      scr: RecreationResourceImageSize.SCREEN,
      pre: RecreationResourceImageSize.PREVIEW,
      thm: RecreationResourceImageSize.THUMBNAIL,
    };

    // Generate URLs for all variants (synchronous - direct URL construction)
    const variants = REQUIRED_VARIANTS.map((sizeCode) => ({
      url: this.constructImageUrl(
        payload.rec_resource_id,
        payload.image_id,
        sizeCode,
      ),
      size_code: sizeCodeMap[sizeCode],
      extension: 'webp',
      width: 0,
      height: 0,
    }));

    return {
      ref_id: payload.image_id, // Map image_id to ref_id for backward compatibility
      image_id: payload.image_id,
      file_name: payload.file_name,
      created_at: payload.created_at,
      recreation_resource_image_variants: variants,
    };
  }
}
