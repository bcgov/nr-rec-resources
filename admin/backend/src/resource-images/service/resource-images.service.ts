import { AppConfigService } from "@/app-config/app-config.service";
import { DamApiService } from "@/dam-api/dam-api.service";
import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { PresignedUploadService } from "src/upload/services/presigned-upload.service";
import { RecreationResourceImageDto } from "../dto/recreation-resource-image.dto";

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
    private readonly presignedUploadService: PresignedUploadService,
  ) {
    this.imagecollectionId = this.appConfig.damRstImageCollectionId;
  }

  /**
   * Domain-specific helper: Get MIME type for images
   * This contains business rules about what image types are supported
   */
  private getImageMimeType(filename: string): string {
    const extension = filename.toLowerCase().split(".").pop();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "bmp":
        return "image/bmp";
      case "svg":
        return "image/svg+xml";
      case "tiff":
        return "image/tiff";
      default:
        throw new HttpException(`Unsupported image type: ${extension}`, 400);
    }
  }

  /**
   * Domain-specific helper: Validate if file is a supported image type
   */
  private isValidImageType(filename: string): boolean {
    const extension = filename.toLowerCase().split(".").pop();
    const supportedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "svg",
      "tiff",
    ];
    return supportedExtensions.includes(extension || "");
  }

  /**
   * Convert S3 file info to Express.Multer.File format with domain-specific MIME type
   */
  private createMulterFileFromS3(
    s3FileInfo: any,
    originalName: string,
  ): Express.Multer.File {
    return {
      fieldname: "file",
      originalname: originalName,
      encoding: "binary",
      mimetype: this.getImageMimeType(originalName),
      size: s3FileInfo.size,
      buffer: s3FileInfo.buffer,
      stream: null as any,
      destination: "",
      filename: "",
      path: "",
    };
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
    const { ref_id, files } =
      await this.damApiService.createAndUploadImageWithRetry(caption, file);
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

  /**
   * Generate a presigned upload URL for image uploads
   * This method handles the domain-specific logic for image presigned URLs
   */
  async generatePresignedUploadUrl(
    rec_resource_id: string,
    fileName: string,
    fileSize: number,
    contentType: string = "image/jpeg",
  ) {
    // Verify the recreation resource exists
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }

    // Domain validation: ensure it's a supported image type
    if (!this.isValidImageType(fileName)) {
      throw new HttpException("Unsupported image type", 400);
    }

    // Use domain-specific MIME type if not provided
    const mimeType = contentType || this.getImageMimeType(fileName);

    // Delegate to the presigned upload service
    return this.presignedUploadService.generatePresignedUploadUrl(
      rec_resource_id,
      fileName,
      fileSize,
      mimeType,
    );
  }

  /**
   * Complete the upload workflow: S3 → DAM → Database
   * This method orchestrates the entire process for image uploads
   */
  async completeUploadWorkflow(
    rec_resource_id: string,
    uploadId: string,
    caption: string,
    originalFileName: string,
  ): Promise<RecreationResourceImageDto> {
    // Verify the recreation resource exists
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }

    // Domain validation: ensure it's a supported image type
    if (!this.isValidImageType(originalFileName)) {
      throw new HttpException("Unsupported image type", 400);
    }

    try {
      // Step 1: Download file from S3
      const s3FileInfo = await this.presignedUploadService.downloadFileFromS3(
        rec_resource_id,
        uploadId,
        originalFileName,
      );

      // Step 2: Convert to Multer file format with domain-specific MIME type
      const multerFile = this.createMulterFileFromS3(
        s3FileInfo,
        originalFileName,
      );

      // Step 3: Upload to DAM (with retry for images)
      const damResult = await this.damApiService.createAndUploadImageWithRetry(
        caption,
        multerFile,
      );

      // Step 4: Get image variants from DAM
      const files = await this.damApiService.getResourcePathWithRetry(
        damResult.ref_id,
      );

      // Step 5: Create database entry with all image variants
      const result = await this.prisma.recreation_resource_images.create({
        data: {
          ref_id: String(damResult.ref_id),
          rec_resource_id,
          caption,
          recreation_resource_image_variants: {
            create: files.map((f: any) => ({
              size_code: f.size_code,
              url: this.getFilePath(f.url),
              width: f.width,
              height: f.height,
              extension: f.extension,
            })),
          },
        },
      });

      // Step 6: Clean up S3 file
      await this.presignedUploadService.cleanupS3File(s3FileInfo.key);

      return this.mapResponse(result);
    } catch (error) {
      // Clean up S3 file on error
      try {
        const key = `uploads/${rec_resource_id}/${uploadId}/${originalFileName}`;
        await this.presignedUploadService.cleanupS3File(key);
      } catch (cleanupError) {
        // Log cleanup error but don't fail the main error
        console.warn(`Failed to cleanup S3 file: ${cleanupError.message}`);
      }
      throw error;
    }
  }

  /**
   * Create an image entry from a presigned upload completion
   * @deprecated Use completeUploadWorkflow instead for new implementations
   * This method is kept for backward compatibility
   */
  async createFromPresignedUpload(
    rec_resource_id: string,
    caption: string,
    originalFileName: string,
    imageId: string,
    fileSize: number,
  ): Promise<RecreationResourceImageDto> {
    // Verify the recreation resource exists
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }

    // Get the image files from DAM to extract variants
    const files = await this.damApiService.getResourcePathWithRetry(imageId);

    // Create the database entry with all image variants
    const result = await this.prisma.recreation_resource_images.create({
      data: {
        ref_id: imageId,
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
