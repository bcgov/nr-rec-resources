import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceImageDto } from "../dto/recreation-resource-image.dto";
import {
  uploadFile,
  createResource,
  getResourcePath,
  deleteResource,
  addResourceToCollection,
} from "../../dam-api/dam-api";

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
  constructor(private readonly prisma: PrismaService) {}

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
    const ref_id = await createResource(caption);
    await uploadFile(ref_id, file);
    await addResourceToCollection(ref_id);
    let files = await getResourcePath(ref_id);
    if (!this.checkFileTypes(files)) {
      try {
        files = await this.retryGetResourcePath(ref_id);
      } catch (err) {
        await deleteResource(ref_id);
        throw err;
      }
    }
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
      await uploadFile(ref_id, file);
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
    await deleteResource(ref_id);
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
    return originalUrl.replace(`${process.env.DAM_URL}`, "");
  }

  private mapResponse(payload: any) {
    return {
      ...payload,
    };
  }

  private checkFileTypes(files: any[]) {
    return (
      files.filter(
        (f: any) =>
          f.size_code === "original" ||
          f.size_code === "thm" ||
          f.size_code === "pre",
      ).length >= 3
    );
  }

  private async retryGetResourcePath(ref_id: string) {
    for (let tries = 0; tries < 3; tries++) {
      const files = await getResourcePath(ref_id);
      if (this.checkFileTypes(files)) {
        return files;
      }
    }
    throw new HttpException("Server error: File images not found", 500);
  }
}
