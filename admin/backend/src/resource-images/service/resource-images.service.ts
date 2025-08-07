import { AppConfigService } from "@/app-config/app-config.service";
import { DamApiService } from "@/dam-api/dam-api.service";
import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceImageDto } from "../dto/recreation-resource-image.dto";
import { DamMetadataDto } from "@/dam-api/dto/dam-metadata.dto";

const allowedTypes = [
  "image/apng",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];

@Injectable()
export class ResourceImagesService {
  imagecollectionId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
    private readonly damApiService: DamApiService,
  ) {
    this.imagecollectionId = this.appConfig.damRstImageCollectionId;
  }

  async getAll(
    rec_resource_id: string,
  ): Promise<RecreationResourceImageDto[] | null> {
    const result = await this.prisma.recreation_resource_images.findMany({
      where: {
        rec_resource_id,
      },
      select: {
        rec_resource_id: true,
        caption: true,
        ref_id: true,
        created_at: true,
        recreation_resource_image_variants: {
          select: {
            url: true,
            extension: true,
            width: true,
            height: true,
            size_code: true,
            created_at: true,
          },
        },
      },
    });
    return result.map((i) => this.mapResponse(i));
  }

  async getImageByResourceId(
    rec_resource_id: string,
    ref_id: string,
  ): Promise<RecreationResourceImageDto> {
    const result = await this.prisma.recreation_resource_images.findUnique({
      where: {
        rec_resource_id,
        ref_id,
      },
      select: {
        rec_resource_id: true,
        caption: true,
        ref_id: true,
        created_at: true,
        recreation_resource_image_variants: {
          select: {
            url: true,
            extension: true,
            width: true,
            height: true,
            size_code: true,
            created_at: true,
          },
        },
      },
    });

    if (result === null) {
      throw new HttpException("Recreation Resource image not found", 404);
    }

    return this.mapResponse(result);
  }

  async create(
    rec_resource_id: string,
    caption: string,
    file: Express.Multer.File,
  ): Promise<RecreationResourceImageDto> {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new HttpException("File Type not allowed", 415);
    }
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation image not found", 404);
    }
    const metadata: DamMetadataDto = {
      caption,
      closestCommunity: resource.closest_community,
      recreationName: `${resource.name} - ${resource.rec_resource_id}`,
      recreationDistrict: resource.district_code,
    };
    const { ref_id, files } =
      await this.damApiService.createAndUploadImageWithRetry(metadata, file);
    const result = await this.prisma.recreation_resource_images.create({
      data: {
        ref_id: ref_id.toString(),
        rec_resource_id,
        caption,
        recreation_resource_image_variants: {
          create: files.map((f: any) => {
            return {
              size_code: f.size_code,
              url: this.getFilePath(f.url),
              width: f.width,
              height: f.height,
              extension: f.extension,
            };
          }),
        },
      },
    });
    return this.mapResponse(result);
  }

  async update(
    rec_resource_id: string,
    ref_id: string,
    caption: string,
    file: Express.Multer.File | undefined,
  ): Promise<RecreationResourceImageDto> {
    const docToUpdate = {
      caption,
    };
    const resource = await this.prisma.recreation_resource_images.findUnique({
      where: {
        rec_resource_id,
        ref_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation image not found", 404);
    }
    if (file) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new HttpException("File Type not allowed", 415);
      }
      await this.damApiService.uploadFile(ref_id, file);
    }
    const result = await this.prisma.recreation_resource_images.update({
      where: {
        rec_resource_id,
        ref_id,
      },
      data: docToUpdate,
    });

    return this.mapResponse(result);
  }

  async delete(
    rec_resource_id: string,
    ref_id: string,
  ): Promise<RecreationResourceImageDto | null> {
    await this.damApiService.deleteResource(ref_id);
    await this.prisma.recreation_resource_image_variants.deleteMany({
      where: {
        ref_id,
      },
    });
    const result = await this.prisma.recreation_resource_images.delete({
      where: {
        rec_resource_id,
        ref_id,
      },
    });

    return this.mapResponse(result);
  }

  private getFilePath(originalUrl: string) {
    return originalUrl.replace(`${this.appConfig.damUrl}`, "");
  }

  private mapResponse(payload: any) {
    return {
      ...payload,
    };
  }
}
