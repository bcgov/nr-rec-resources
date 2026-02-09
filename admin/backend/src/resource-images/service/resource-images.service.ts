import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { S3Service } from '@/s3/s3.service';
import { HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import {
  FinalizeImageUploadRequestDto,
  RecreationResourceImageDto,
} from '../dto/recreation-resource-image.dto';
import { RecreationResourceImageSize } from '@shared/constants/images';
import { ConsentFormsS3Service } from './consent-forms-s3.service';

const REQUIRED_VARIANTS = ['original', 'scr', 'pre', 'thm'] as const;
type ImageVariantType = (typeof REQUIRED_VARIANTS)[number];

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
    s3Service: S3Service,
    private readonly consentFormsS3Service: ConsentFormsS3Service,
  ) {
    super(ResourceImagesService.name, prisma, appConfig, s3Service);
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
        updated_by: true,
        created_by: true,
        recreation_image_consent_form: {
          select: {
            doc_id: true,
            date_taken: true,
            contains_pii: true,
            photographer_type_code: true,
            photographer_name: true,
            recreation_photographer_type_code: {
              select: {
                description: true,
              },
            },
          },
        },
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
        updated_by: true,
        created_by: true,
        recreation_image_consent_form: {
          select: {
            doc_id: true,
            date_taken: true,
            contains_pii: true,
            photographer_type_code: true,
            photographer_name: true,
            recreation_photographer_type_code: {
              select: {
                description: true,
              },
            },
          },
        },
      },
    });

    if (result === null) {
      throw new HttpException('Recreation Resource image not found', 404);
    }

    return this.mapResponse(result);
  }

  /**
   * Create database record with image and variants
   */
  private async createDatabaseRecord(
    rec_resource_id: string,
    image_id: string,
    file_name: string,
    file_size: number,
  ) {
    return this.prisma.recreation_resource_image.create({
      data: {
        image_id,
        rec_resource_id,
        file_name: file_name,
        extension: 'webp',
        file_size: BigInt(file_size),
        created_by: 'system',
        created_at: new Date(),
      },
    });
  }

  /**
   * Generate presigned upload URLs for 4 image variants
   * Called before client-side image processing and upload
   * @param rec_resource_id - Recreation resource ID
   * @param fileName - filename with extension (e.g., my-image.webp) to tag on original.webp
   */
  async presignUpload(rec_resource_id: string, fileName: string) {
    // Check if resource exists
    await this.validateResourceExists(rec_resource_id);

    // Generate image_id
    const image_id = randomUUID();

    try {
      const sizeCodeMap = {
        original: RecreationResourceImageSize.ORIGINAL,
        scr: RecreationResourceImageSize.SCREEN,
        pre: RecreationResourceImageSize.PREVIEW,
        thm: RecreationResourceImageSize.THUMBNAIL,
      };

      // Generate presigned URLs for all 4 variants
      const presignedUrls = await Promise.all(
        REQUIRED_VARIANTS.map(async (sizeCode) => {
          const key = this.constructS3Path(rec_resource_id, image_id, sizeCode);

          // Add filename tag only to the original variant
          const tags =
            sizeCode === 'original' && fileName
              ? { filename: fileName }
              : undefined;

          const url = await this.generatePresignedUrl(
            key,
            'image/webp',
            900, // 15 minutes
            tags,
          );

          return {
            key,
            url,
            size_code: sizeCodeMap[sizeCode],
          };
        }),
      );

      this.logger.log(
        `Generated presigned URLs for image upload: rec_resource_id=${rec_resource_id}, image_id=${image_id}${fileName ? `, filename=${fileName}` : ''}`,
      );

      return {
        image_id,
        presigned_urls: presignedUrls,
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to generate presigned URLs for rec_resource_id: ${rec_resource_id}`,
        'Failed to generate presigned URLs',
      );
    }
  }

  /**
   * Finalize image upload by creating database record
   * Optionally creates consent form records if consent data or file is provided
   * Called after all S3 uploads complete successfully
   * No S3 verification is performed
   */
  async finalizeUpload(
    rec_resource_id: string,
    body: FinalizeImageUploadRequestDto,
    consentFormFile?: Express.Multer.File,
  ): Promise<RecreationResourceImageDto> {
    const {
      image_id,
      file_name,
      file_size_original,
      date_taken,
      contains_pii,
      photographer_type,
      photographer_name,
    } = body;

    // Check if resource exists
    await this.validateResourceExists(rec_resource_id);

    // Validate image_id format (basic UUID validation)
    this.validateEntityId(image_id, 'image_id');

    const hasConsentFile = !!consentFormFile;

    try {
      // If no consent file, do simple create
      if (!hasConsentFile) {
        const result = await this.createDatabaseRecord(
          rec_resource_id,
          image_id,
          file_name,
          file_size_original,
        );

        this.logger.log(
          `Finalized image upload: rec_resource_id=${rec_resource_id}, image_id=${image_id}`,
        );

        return this.mapResponse(result);
      }

      // Upload consent form to S3 first
      const docId = randomUUID();
      await this.consentFormsS3Service.uploadConsentForm(
        rec_resource_id,
        image_id,
        docId,
        consentFormFile.buffer,
        consentFormFile.originalname,
      );

      // Use transaction for atomic creation of all records
      const result = await this.prisma.$transaction(async (tx) => {
        // Create image record
        const imageRecord = await tx.recreation_resource_image.create({
          data: {
            image_id,
            rec_resource_id,
            file_name,
            extension: 'webp',
            file_size: BigInt(file_size_original),
            created_by: 'system',
            created_at: new Date(),
          },
        });

        // Create document record for consent form PDF
        await tx.recreation_resource_document.create({
          data: {
            doc_id: docId,
            rec_resource_id,
            doc_code: 'IC',
            file_name: consentFormFile.originalname,
            extension: 'pdf',
            file_size: BigInt(consentFormFile.size),
            created_by: 'system',
            created_at: new Date(),
          },
        });

        // Create consent form record linking image to document
        await tx.recreation_image_consent_form.create({
          data: {
            image_id,
            doc_id: docId,
            date_taken: date_taken ? new Date(date_taken) : null,
            contains_pii: contains_pii ?? false,
            photographer_type_code: photographer_type ?? 'UNKNOWN',
            photographer_name: photographer_name ?? null,
            created_by: 'system',
            created_at: new Date(),
          },
        });

        return imageRecord;
      });

      this.logger.log(
        `Finalized image upload with consent form: rec_resource_id=${rec_resource_id}, image_id=${image_id}`,
      );

      return this.mapResponse(result);
    } catch (error) {
      this.handleError(
        error,
        `Failed to finalize image upload for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
        'Failed to finalize upload',
      );
    }
  }

  /**
   * Delete image from datatabase and S3
   * @param rec_resource_id - Recreation resource ID
   * @param image_id - image ID
   * @param soft_delete - if set to true keeps the image on S3
   */
  async delete(
    rec_resource_id: string,
    image_id: string,
    soft_delete: boolean = true,
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
      if (!soft_delete) {
        // Delete all S3 objects for this image
        const prefix = `images/${rec_resource_id}/${image_id}/`;
        const objects = await this.s3Service.listObjectsByPrefix(prefix);

        this.logger.log(
          `Deleting ${objects.length} image variants for imageId: ${image_id}`,
        );

        // Delete each variant
        for (const object of objects) {
          await this.s3Service.deleteFile(object.key);
        }
      }

      this.logger.log(
        `All image variants deleted successfully for imageId: ${image_id}`,
      );

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

    const consentForm = payload.recreation_image_consent_form;

    return {
      ref_id: payload.image_id, // Map image_id to ref_id for backward compatibility
      image_id: payload.image_id,
      file_name: payload.file_name,
      created_at: payload.created_at,
      recreation_resource_image_variants: variants,
      file_size: payload.file_size ? Number(payload.file_size) : undefined,
      date_taken:
        consentForm?.date_taken?.toISOString?.()?.split('T')[0] ?? undefined,
      photographer_type: consentForm?.photographer_type_code ?? undefined,
      photographer_type_description:
        consentForm?.recreation_photographer_type_code?.description ??
        undefined,
      photographer_name: consentForm?.photographer_name ?? undefined,
      photographer_display_name:
        consentForm?.photographer_name ??
        payload.updated_by ??
        payload.created_by ??
        undefined,
      contains_pii: consentForm?.contains_pii ?? undefined,
    };
  }

  /**
   * Get presigned download URL for consent form
   * @param rec_resource_id - Recreation resource ID
   * @param image_id - Image UUID
   * @returns Presigned download URL
   * @throws HttpException if image or consent form not found
   */
  async getConsentDownloadUrl(
    rec_resource_id: string,
    image_id: string,
  ): Promise<string> {
    // Find consent form for this image
    const consentForm =
      await this.prisma.recreation_image_consent_form.findUnique({
        where: { image_id },
        select: { doc_id: true },
      });

    if (!consentForm) {
      throw new HttpException('Consent form not found for this image', 404);
    }

    return this.consentFormsS3Service.getPresignedDownloadUrl(
      rec_resource_id,
      image_id,
      consentForm.doc_id,
    );
  }
}
