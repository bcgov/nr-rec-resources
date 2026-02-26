import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { S3Service } from '@/s3/s3.service';
import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import {
  FinalizeImageUploadRequestDto,
  RecreationResourceImageDto,
} from '../dto/recreation-resource-image.dto';
import {
  UpdateImageConsentDto,
  UpdateImageConsentPatchDto,
} from '../dto/update-image-consent.dto';
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

const IMAGE_WITH_CONSENT_SELECT = {
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
};

const IMAGE_SIZE_CODE_MAP: Record<
  ImageVariantType,
  RecreationResourceImageSize
> = {
  original: RecreationResourceImageSize.ORIGINAL,
  scr: RecreationResourceImageSize.SCREEN,
  pre: RecreationResourceImageSize.PREVIEW,
  thm: RecreationResourceImageSize.THUMBNAIL,
};

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
      select: IMAGE_WITH_CONSENT_SELECT,
    });
    return result.map((i) => this.mapResponse(i));
  }

  async getImageByResourceId(
    rec_resource_id: string,
    image_id: string,
  ): Promise<RecreationResourceImageDto> {
    const result = await this.getImageWithConsent(rec_resource_id, image_id);
    return this.mapResponse(result);
  }

  async createImageConsent(
    rec_resource_id: string,
    image_id: string,
    body: UpdateImageConsentDto,
    consentFormFile?: Express.Multer.File,
  ): Promise<RecreationResourceImageDto> {
    await this.validateResourceExists(rec_resource_id);
    this.validateEntityId(image_id, 'image_id');
    await this.assertImageExists(rec_resource_id, image_id);

    const {
      file_name,
      date_taken,
      contains_pii,
      photographer_type,
      photographer_name,
    } = body;

    let docId: string | null = null;
    let uploadedConsentKey: string | null = null;

    try {
      const existingConsent =
        await this.prisma.recreation_image_consent_form.findUnique({
          where: { image_id },
          select: { consent_id: true },
        });

      if (existingConsent) {
        throw new HttpException(
          'Consent metadata already exists for this image',
          409,
        );
      }

      const normalizedConsent = this.normalizeConsentInput(
        { date_taken, contains_pii, photographer_type, photographer_name },
        consentFormFile,
      );

      if (consentFormFile) {
        docId = randomUUID();
        uploadedConsentKey = await this.consentFormsS3Service.uploadConsentForm(
          rec_resource_id,
          image_id,
          docId,
          consentFormFile.buffer,
          consentFormFile.originalname,
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        if (file_name !== undefined) {
          await tx.recreation_resource_image.update({
            where: { rec_resource_id, image_id },
            data: {
              file_name,
              updated_by: 'system',
              updated_at: new Date(),
            },
          });
        }

        await this.createConsentRecords(tx, {
          rec_resource_id,
          image_id,
          consentFormFile,
          docId,
          consentData: normalizedConsent,
        });

        return this.getImageWithConsent(rec_resource_id, image_id, tx);
      });

      if (!result) {
        throw new HttpException('Recreation Resource image not found', 404);
      }

      return this.mapResponse(result);
    } catch (error) {
      if (uploadedConsentKey) {
        await this.consentFormsS3Service
          .getS3Service()
          .deleteFile(uploadedConsentKey)
          .catch(() => undefined);
      }
      this.handleError(
        error,
        `Failed to create image consent for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
        'Failed to create image consent',
      );
    }
  }

  async updateImageConsent(
    rec_resource_id: string,
    image_id: string,
    body: UpdateImageConsentPatchDto,
  ): Promise<RecreationResourceImageDto> {
    await this.validateResourceExists(rec_resource_id);
    this.validateEntityId(image_id, 'image_id');
    await this.assertImageExists(rec_resource_id, image_id);

    try {
      const existingConsent =
        await this.prisma.recreation_image_consent_form.findUnique({
          where: { image_id },
          select: { consent_id: true },
        });

      if (!existingConsent) {
        throw new HttpException('Consent form not found for this image', 404);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        if (body.file_name !== undefined) {
          await tx.recreation_resource_image.update({
            where: { rec_resource_id, image_id },
            data: {
              file_name: body.file_name,
              updated_by: 'system',
              updated_at: new Date(),
            },
          });
        }

        await tx.recreation_image_consent_form.update({
          where: { image_id },
          data: {
            date_taken:
              body.date_taken === undefined
                ? undefined
                : body.date_taken
                  ? new Date(body.date_taken)
                  : null,
            updated_by: 'system',
            updated_at: new Date(),
          },
        });

        return this.getImageWithConsent(rec_resource_id, image_id, tx);
      });

      if (!result) {
        throw new HttpException('Recreation Resource image not found', 404);
      }

      return this.mapResponse(result);
    } catch (error) {
      this.handleError(
        error,
        `Failed to update image consent for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
        'Failed to update image consent',
      );
    }
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
      // Generate presigned URLs for all 4 variants
      const presignedUrls = await Promise.all(
        REQUIRED_VARIANTS.map(async (sizeCode) => {
          const key = this.constructS3Path(rec_resource_id, image_id, sizeCode);

          const url = await this.generatePresignedUrl(
            key,
            'image/webp',
            900, // 15 minutes
          );

          return {
            key,
            url,
            size_code: IMAGE_SIZE_CODE_MAP[sizeCode],
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

    try {
      const normalizedConsent = this.normalizeConsentInput(
        { date_taken, contains_pii, photographer_type, photographer_name },
        consentFormFile,
      );
      const shouldCreateConsentRecords =
        Boolean(consentFormFile) || normalizedConsent.hasMetadata;

      // Upload consent form PDF to S3 before the DB transaction
      let docId: string | null = null;
      if (consentFormFile) {
        docId = randomUUID();
        await this.consentFormsS3Service.uploadConsentForm(
          rec_resource_id,
          image_id,
          docId,
          consentFormFile.buffer,
          consentFormFile.originalname,
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Always create the image record
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

        if (shouldCreateConsentRecords) {
          await this.createConsentRecords(tx, {
            rec_resource_id,
            image_id,
            consentFormFile,
            docId,
            consentData: normalizedConsent,
          });
        }

        if (!shouldCreateConsentRecords) {
          return imageRecord;
        }

        return this.getImageWithConsent(rec_resource_id, image_id, tx);
      });

      this.logger.log(
        `Finalized image upload: rec_resource_id=${rec_resource_id}, image_id=${image_id}`,
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
          if (consentForm.doc_id) {
            await tx.recreation_resource_document.delete({
              where: { doc_id: consentForm.doc_id },
            });
          }
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
    // Generate URLs for all variants (synchronous - direct URL construction)
    const variants = REQUIRED_VARIANTS.map((sizeCode) => ({
      url: this.constructImageUrl(
        payload.rec_resource_id,
        payload.image_id,
        sizeCode,
      ),
      size_code: IMAGE_SIZE_CODE_MAP[sizeCode],
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
      // Photographer display name, fallback to updated_by then created_by if name not available
      photographer_display_name:
        consentForm?.photographer_name ||
        payload.updated_by ||
        payload.created_by ||
        undefined,
      contains_pii: consentForm?.contains_pii ?? undefined,
      has_consent_metadata: !!consentForm,
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

    if (!consentForm.doc_id) {
      throw new HttpException(
        'No consent form document associated with this image',
        404,
      );
    }

    return this.consentFormsS3Service.getPresignedDownloadUrl(
      rec_resource_id,
      image_id,
      consentForm.doc_id,
    );
  }

  private async assertImageExists(
    rec_resource_id: string,
    image_id: string,
  ): Promise<void> {
    const existingImage =
      await this.prisma.recreation_resource_image.findUnique({
        where: { rec_resource_id, image_id },
        select: { image_id: true },
      });

    if (!existingImage) {
      throw new HttpException('Recreation Resource image not found', 404);
    }
  }

  private async getImageWithConsent(
    rec_resource_id: string,
    image_id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const result = await client.recreation_resource_image.findUnique({
      where: { rec_resource_id, image_id },
      select: IMAGE_WITH_CONSENT_SELECT,
    });

    if (!result) {
      throw new HttpException('Recreation Resource image not found', 404);
    }

    return result;
  }

  private normalizeConsentInput(
    body: ConsentMetadata,
    consentFormFile?: Express.Multer.File,
  ) {
    const hasConsentFile = Boolean(consentFormFile);

    if (body.contains_pii === true && !hasConsentFile) {
      throw new HttpException(
        'consent_form is required when contains_pii is true',
        400,
      );
    }

    if (hasConsentFile && body.contains_pii !== true) {
      throw new HttpException(
        'contains_pii must be true when uploading a consent form',
        400,
      );
    }

    if (hasConsentFile && !body.photographer_type) {
      throw new HttpException(
        'photographer_type is required when uploading a consent form',
        400,
      );
    }

    const hasMetadata =
      body.date_taken !== undefined ||
      body.contains_pii !== undefined ||
      body.photographer_type !== undefined ||
      body.photographer_name !== undefined;

    return {
      date_taken: body.date_taken,
      contains_pii: body.contains_pii ?? false,
      photographer_type: body.photographer_type,
      photographer_name: body.photographer_name,
      hasMetadata,
    };
  }

  private async createConsentRecords(
    tx: Prisma.TransactionClient,
    input: {
      rec_resource_id: string;
      image_id: string;
      consentFormFile?: Express.Multer.File;
      docId: string | null;
      consentData: {
        date_taken?: string;
        contains_pii?: boolean;
        photographer_type?: string;
        photographer_name?: string;
      };
    },
  ) {
    const { rec_resource_id, image_id, consentFormFile, docId, consentData } =
      input;

    if (consentFormFile && docId) {
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
    }

    await tx.recreation_image_consent_form.create({
      data: {
        image_id,
        doc_id: docId,
        date_taken: consentData.date_taken
          ? new Date(consentData.date_taken)
          : null,
        contains_pii: consentData.contains_pii ?? false,
        photographer_type_code: consentData.photographer_type ?? null,
        photographer_name: consentData.photographer_name ?? null,
        created_by: 'system',
        created_at: new Date(),
      },
    });
  }
}
