import { AppConfigService } from "@/app-config/app-config.service";
import { Injectable, Logger } from "@nestjs/common";
import { DamApiCoreService } from "./dam-api-core.service";
import { DamApiConfig, DamFile, DamResource } from "./dam-api.types";

/**
 * Main DAM API Service - provides a clean interface and maintains backward compatibility
 * Combines core operations and complex workflows in a single service
 */
@Injectable()
export class DamApiService {
  private readonly logger = new Logger(DamApiService.name);
  private readonly config: DamApiConfig;

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly coreService: DamApiCoreService,
  ) {
    this.config = {
      damUrl: `${this.appConfig.damUrl}/api/?`,
      privateKey: this.appConfig.damPrivateKey,
      user: this.appConfig.damUser,
      pdfCollectionId: this.appConfig.damRstPdfCollectionId,
      imageCollectionId: this.appConfig.damRstImageCollectionId,
      pdfResourceType: this.appConfig.damResourceTypePdf,
      imageResourceType: this.appConfig.damResourceTypeImage,
    };

    this.logger.log(
      `DAM API Service initialized - User: ${this.config.user}, URL: ${this.appConfig.damUrl}, PDF Collection: ${this.config.pdfCollectionId}, Image Collection: ${this.config.imageCollectionId}`,
    );
  }

  // Core Operations (delegate to core service)

  async createResource(
    title: string,
    resourceType: "pdf" | "image" = "pdf",
  ): Promise<string> {
    return this.coreService.createResource(title, resourceType, this.config);
  }

  async getResourcePath(resource: string): Promise<DamFile[]> {
    return this.coreService.getResourcePath(resource, this.config);
  }

  async getResourcePathWithRetry(resource: string): Promise<DamFile[]> {
    return this.coreService.getResourcePathWithRetry(resource, this.config);
  }

  async addResourceToCollection(
    resource: string,
    collectionType: "pdf" | "image" = "pdf",
  ): Promise<any> {
    return this.coreService.addResourceToCollection(
      resource,
      collectionType,
      this.config,
    );
  }

  async uploadFile(ref: string, file: Express.Multer.File): Promise<any> {
    return this.coreService.uploadFile(ref, file, this.config);
  }

  async deleteResource(resource: string): Promise<any> {
    return this.coreService.deleteResource(resource, this.config);
  }

  // Workflow Operations (implemented directly)

  /**
   * Complete workflow: creates resource, uploads file, adds to collection, and returns processed files
   * For PDF documents
   */
  async createAndUploadDocument(
    title: string,
    file: Express.Multer.File,
  ): Promise<DamResource> {
    this.logger.log(
      `Creating and uploading document: ${title}, file: ${file.originalname}, size: ${file.size}`,
    );

    const ref_id = await this.coreService.createResource(
      title,
      "pdf",
      this.config,
    );
    await this.coreService.uploadFile(ref_id, file, this.config);
    await this.coreService.addResourceToCollection(ref_id, "pdf", this.config);
    const files = await this.coreService.getResourcePath(ref_id, this.config);

    this.logger.log(`Document created and uploaded successfully`, {
      title,
      ref_id,
      fileName: file.originalname,
      fileCount: files.length,
    });

    return { ref_id, files };
  }

  /**
   * Complete workflow: creates resource, uploads image, adds to collection, and returns processed files
   * For image files (standard processing)
   */
  async createAndUploadImage(
    caption: string,
    file: Express.Multer.File,
  ): Promise<DamResource> {
    this.logger.log(`Creating and uploading image`, {
      caption,
      fileName: file.originalname,
      fileSize: file.size,
    });

    const ref_id = await this.coreService.createResource(
      caption,
      "image",
      this.config,
    );
    await this.coreService.uploadFile(ref_id, file, this.config);
    await this.coreService.addResourceToCollection(
      ref_id,
      "image",
      this.config,
    );
    const files = await this.coreService.getResourcePath(ref_id, this.config);

    this.logger.log(`Image created and uploaded successfully`, {
      caption,
      ref_id,
      fileName: file.originalname,
      fileCount: files.length,
    });

    return { ref_id, files };
  }

  /**
   * Complete workflow with retry logic: creates resource, uploads image, adds to collection,
   * and returns processed files with all variants ready
   * For image files (with processing validation)
   */
  async createAndUploadImageWithRetry(
    caption: string,
    file: Express.Multer.File,
  ): Promise<DamResource> {
    this.logger.log(
      `Creating and uploading image with retry - Caption: "${caption}", File: ${file.originalname} (${file.size} bytes)`,
    );

    const ref_id = await this.coreService.createResource(
      caption,
      "image",
      this.config,
    );
    await this.coreService.uploadFile(ref_id, file, this.config);
    await this.coreService.addResourceToCollection(
      ref_id,
      "image",
      this.config,
    );
    const files = await this.coreService.getResourcePathWithRetry(
      ref_id,
      this.config,
    );

    this.logger.log(
      `Image created and uploaded with retry successfully - Caption: "${caption}", ID: ${ref_id}, File: ${file.originalname}, Variants: ${files.length}`,
    );

    return { ref_id, files };
  }
}
