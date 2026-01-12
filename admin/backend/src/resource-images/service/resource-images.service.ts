import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import {
  RecreationResourceImageDto,
  RecreationResourceImageSize,
} from '../dto/recreation-resource-image.dto';
import { RecResourceImagesS3Service } from './rec-resource-images-s3.service';

// Constants
const REQUIRED_VARIANTS = ['original', 'scr', 'pre', 'thm'] as const;
type ImageVariantType = (typeof REQUIRED_VARIANTS)[number];

interface ImageVariantFiles {
  original: Express.Multer.File;
  scr: Express.Multer.File;
  pre: Express.Multer.File;
  thm: Express.Multer.File;
}

@Injectable()
export class ResourceImagesService extends BaseStorageFileService {
  constructor(
    prisma: PrismaService,
    appConfig: AppConfigService,
    private readonly s3Service: RecResourceImagesS3Service,
  ) {
    super(ResourceImagesService.name, prisma, appConfig);
  }

  /**
   * Get storage configuration for resource images
   */
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
  ): Promise<RecreationResourceImageDto> {
    // File validation (MIME type, size, presence) is handled by multi-file validation pipe at controller level

    // Check if resource exists
    await this.validateResourceExists(rec_resource_id);

    // Generate image_id
    const image_id = randomUUID();

    try {
      // Prepare variants for upload
      // Only tag the original variant with file_name (others are derivatives)
      const variants = REQUIRED_VARIANTS.map((sizeCode) => ({
        sizeCode,
        buffer: variantFiles[sizeCode].buffer,
        metadata:
          sizeCode === 'original'
            ? {
                filename: file_name,
              }
            : undefined,
      }));

      // Upload all variants to S3 (transactional) with metadata tags
      await this.s3Service.uploadImageVariants(
        rec_resource_id,
        image_id,
        variants,
      );

      this.logger.log(
        `Successfully uploaded ${variants.length} image variants to S3 for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
      );

      const result = await this.createDatabaseRecord(
        rec_resource_id,
        image_id,
        file_name,
        variantFiles.original.size,
      );

      return this.mapResponse(result);
    } catch (error) {
      this.handleError(
        error,
        `Failed to create image for rec_resource_id: ${rec_resource_id}`,
        'Failed to upload image',
      );
    }
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
      // Delete all S3 objects for this image
      await this.s3Service.deleteImageVariants(rec_resource_id, image_id);

      // Delete database record
      const result = await this.prisma.recreation_resource_image.delete({
        where: {
          rec_resource_id,
          image_id,
        },
      });

      this.logger.log(
        `Successfully deleted image for rec_resource_id: ${rec_resource_id}, image_id: ${image_id}`,
      );

      return this.mapResponse(result);
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
