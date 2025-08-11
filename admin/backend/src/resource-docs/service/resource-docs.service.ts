import { AppConfigService } from "@/app-config/app-config.service";
import { DamApiService } from "@/dam-api/dam-api.service";
import { HttpException, Injectable } from "@nestjs/common";
import path from "path";
import { PrismaService } from "src/prisma.service";
import { PresignedUploadService } from "src/upload/services/presigned-upload.service";
import {
  RecreationResourceDocCode,
  RecreationResourceDocDto,
} from "../dto/recreation-resource-doc.dto";

const allowedTypes = ["application/pdf"];

@Injectable()
export class ResourceDocsService {
  docsCollectionId: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
    private readonly damApiService: DamApiService,
    private readonly presignedUploadService: PresignedUploadService,
  ) {
    this.docsCollectionId = this.appConfig.damRstPdfCollectionId;
  }

  /**
   * Domain-specific helper: Get MIME type for documents
   * This contains business rules about what document types are supported
   */
  private getDocumentMimeType(filename: string): string {
    const extension = filename.toLowerCase().split(".").pop();
    switch (extension) {
      case "pdf":
        return "application/pdf";
      default:
        throw new HttpException(`Unsupported document type: ${extension}`, 400);
    }
  }

  /**
   * Domain-specific helper: Validate if file is a supported document type
   */
  private isValidDocumentType(filename: string): boolean {
    const extension = filename.toLowerCase().split(".").pop();
    const supportedExtensions = ["pdf"];
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
      mimetype: this.getDocumentMimeType(originalName),
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
  ): Promise<RecreationResourceDocDto[] | null> {
    const result = await this.prisma.recreation_resource_docs.findMany({
      where: {
        rec_resource_id,
      },
      select: {
        doc_code: true,
        rec_resource_id: true,
        url: true,
        title: true,
        ref_id: true,
        extension: true,
        created_at: true,
        recreation_resource_doc_code: {
          select: {
            description: true,
          },
        },
      },
    });
    return result.map((i) => this.mapResponse(i));
  }

  async getDocumentByResourceId(
    rec_resource_id: string,
    ref_id: string,
  ): Promise<RecreationResourceDocDto> {
    const result = await this.prisma.recreation_resource_docs.findUnique({
      where: {
        rec_resource_id,
        ref_id,
      },
      select: {
        doc_code: true,
        rec_resource_id: true,
        url: true,
        title: true,
        ref_id: true,
        extension: true,
        recreation_resource_doc_code: {
          select: {
            description: true,
          },
        },
      },
    });

    if (result === null) {
      throw new HttpException("Recreation Resource document not found", 404);
    }

    return this.mapResponse(result);
  }

  async create(
    rec_resource_id: string,
    title: string,
    file: Express.Multer.File,
  ): Promise<RecreationResourceDocDto> {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new HttpException("File Type not allowed", 415);
    }
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }
    const { ref_id, files } = await this.damApiService.createAndUploadDocument(
      title,
      file,
    );
    const url = this.getOriginalFilePath(files);
    const result = await this.prisma.recreation_resource_docs.create({
      data: {
        ref_id: ref_id.toString(),
        doc_code: RecreationResourceDocCode.RM,
        rec_resource_id,
        url,
        title,
        extension: path.extname(file.originalname).replace(".", ""),
      },
    });
    return this.mapResponse(result);
  }

  /**
   * Generate a presigned upload URL for document uploads
   * This method handles the domain-specific logic for document presigned URLs
   */
  async generatePresignedUploadUrl(
    rec_resource_id: string,
    fileName: string,
    fileSize: number,
    contentType: string = "application/pdf",
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

    // Domain validation: ensure it's a supported document type
    if (!this.isValidDocumentType(fileName)) {
      throw new HttpException("Unsupported document type", 400);
    }

    // Use domain-specific MIME type if not provided
    const mimeType = contentType || this.getDocumentMimeType(fileName);

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
   * This method orchestrates the entire process for document uploads
   */
  async completeUploadWorkflow(
    rec_resource_id: string,
    uploadId: string,
    title: string,
    originalFileName: string,
  ): Promise<RecreationResourceDocDto> {
    // Verify the recreation resource exists
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }

    try {
      // Step 1: Download file from S3
      const s3FileInfo = await this.presignedUploadService.downloadFileFromS3(
        rec_resource_id,
        uploadId,
        originalFileName,
      );

      // Step 2: Convert to Multer file format
      // Convert to Multer file format for DAM API compatibility
      const file = this.createMulterFileFromS3(s3FileInfo, originalFileName);

      // Step 3: Upload to DAM
      const damResult = await this.damApiService.createAndUploadDocument(
        title,
        file,
      );

      // Step 4: Create database entry
      const files = await this.damApiService.getResourcePath(damResult.ref_id);
      const url = this.getOriginalFilePath(files);

      const result = await this.prisma.recreation_resource_docs.create({
        data: {
          ref_id: String(damResult.ref_id),
          doc_code: RecreationResourceDocCode.RM,
          rec_resource_id,
          url,
          title,
          extension: path.extname(originalFileName).replace(".", ""),
        },
      });

      // Step 5: Clean up S3 file
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
   * Create a document entry from a presigned upload completion
   * @deprecated Use completeUploadWorkflow instead for new implementations
   * This method is kept for backward compatibility
   */
  async createFromPresignedUpload(
    rec_resource_id: string,
    title: string,
    originalFileName: string,
    documentId: string,
    fileSize: number,
  ): Promise<RecreationResourceDocDto> {
    // Verify the recreation resource exists
    const resource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }

    // Get the document files from DAM to extract URL
    const files = await this.damApiService.getResourcePath(documentId);
    const url = this.getOriginalFilePath(files);

    // Create the database entry
    const result = await this.prisma.recreation_resource_docs.create({
      data: {
        ref_id: String(documentId),
        doc_code: RecreationResourceDocCode.RM,
        rec_resource_id,
        url,
        title,
        extension: path.extname(originalFileName).replace(".", ""),
      },
    });

    return this.mapResponse(result);
  }

  async update(
    rec_resource_id: string,
    ref_id: string,
    title: string,
    file: Express.Multer.File | undefined,
  ): Promise<RecreationResourceDocDto> {
    const docToUpdate = {
      title,
    };
    const resource = await this.prisma.recreation_resource_docs.findUnique({
      where: {
        rec_resource_id,
        ref_id,
      },
    });
    if (resource === null) {
      throw new HttpException("Recreation Resource not found", 404);
    }
    if (file) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new HttpException("File Type not allowed", 415);
      }
      await this.damApiService.uploadFile(ref_id, file);
    }
    const result = await this.prisma.recreation_resource_docs.update({
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
  ): Promise<RecreationResourceDocDto | null> {
    await this.damApiService.deleteResource(ref_id);
    const result = await this.prisma.recreation_resource_docs.delete({
      where: {
        rec_resource_id,
        ref_id,
      },
    });

    return this.mapResponse(result);
  }

  private mapResponse(payload: any) {
    return {
      ...payload,
      doc_code: payload?.doc_code as RecreationResourceDocCode,
      doc_code_description: payload?.recreation_resource_doc_code?.description,
    };
  }

  private getOriginalFilePath(files: any[]) {
    let originalUrl = files
      .find((f: any) => f.size_code === "original")
      .url.replace(this.appConfig.damUrl, "");
    originalUrl = originalUrl.includes("?")
      ? originalUrl.split("?")[0]
      : originalUrl;
    return originalUrl;
  }
}
