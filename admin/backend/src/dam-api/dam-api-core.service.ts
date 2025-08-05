import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Readable } from "stream";
import { DamApiHttpService } from "./dam-api-http.service";
import { DamApiUtilsService } from "./dam-api-utils.service";
import { DAM_CONFIG, DamApiConfig, DamErrors, DamFile } from "./dam-api.types";

/**
 * Core DAM API operations service - handles basic CRUD operations
 */
@Injectable()
export class DamApiCoreService {
  private readonly logger = new Logger(DamApiCoreService.name);

  constructor(
    private readonly httpService: DamApiHttpService,
    private readonly utilsService: DamApiUtilsService,
  ) {}

  /**
   * Creates a new resource in the Digital Asset Management system
   */
  async createResource(
    title: string,
    resourceType: "pdf" | "image",
    config: DamApiConfig,
  ): Promise<string> {
    this.logger.log(
      `Creating DAM resource - Title: "${title}", Type: ${resourceType}, User: ${config.user}`,
    );

    try {
      const resource_type =
        resourceType === "image"
          ? config.imageResourceType
          : config.pdfResourceType;

      const params = {
        user: config.user,
        function: "create_resource",
        metadata: JSON.stringify({ title }),
        resource_type,
        archive: 0,
      };

      this.logger.debug(
        `DAM resource creation parameters - Title: "${title}", Type: ${resourceType}, Resource Type: ${resource_type}, User: ${config.user}`,
      );

      const formData = this.utilsService.createFormData(params, config);
      const result = await this.httpService.makeRequest(
        config.damUrl,
        formData,
      );

      this.logger.log(
        `DAM resource created successfully - Title: "${title}", Type: ${resourceType}, Resource ID: ${result}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create DAM resource - Title: "${title}", Type: ${resourceType}, Error: ${error.message}`,
      );
      throw new HttpException(
        "Error creating resource.",
        DamErrors.ERR_CREATING_RESOURCE,
      );
    }
  }

  /**
   * Gets all image sizes for a resource
   */
  async getResourcePath(
    resource: string,
    config: DamApiConfig,
  ): Promise<DamFile[]> {
    this.logger.debug(
      `Getting DAM resource path - Resource: ${resource}, User: ${config.user}`,
    );

    try {
      const params = {
        user: config.user,
        function: "get_resource_all_image_sizes",
        resource,
      };

      const formData = this.utilsService.createFormData(params, config);
      const result = await this.httpService.makeRequest(
        config.damUrl,
        formData,
      );

      this.logger.debug(
        `DAM resource path retrieved - Resource: ${resource}, Path count: ${Array.isArray(result) ? result.length : "unknown"}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get DAM resource path - Resource: ${resource}, Error: ${error.message}`,
      );
      throw new HttpException(
        "Error getting resource images.",
        DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      );
    }
  }

  /**
   * Adds a resource to a collection
   */
  async addResourceToCollection(
    resource: string,
    collectionType: "pdf" | "image",
    config: DamApiConfig,
  ): Promise<any> {
    this.logger.debug(
      `Adding resource to collection - Resource: ${resource}, Collection Type: ${collectionType}, User: ${config.user}`,
    );

    try {
      const collectionId =
        collectionType === "image"
          ? config.imageCollectionId
          : config.pdfCollectionId;

      this.logger.debug(
        `Collection mapping - Type: ${collectionType}, ID: ${collectionId}`,
      );

      const params = {
        user: config.user,
        function: "add_resource_to_collection",
        resource,
        collection: collectionId,
      };

      const formData = this.utilsService.createFormData(params, config);
      const result = await this.httpService.makeRequest(
        config.damUrl,
        formData,
      );

      this.logger.log(
        `Resource added to collection successfully - Resource: ${resource}, Collection Type: ${collectionType}, Collection ID: ${collectionId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to add resource to collection - Resource: ${resource}, Collection Type: ${collectionType}, Error: ${error.message}`,
      );
      throw new HttpException(
        "Error adding resource to collection.",
        DamErrors.ERR_ADDING_RESOURCE_TO_COLLECTION,
      );
    }
  }

  /**
   * Uploads a file to a resource
   */
  async uploadFile(
    ref: string,
    file: Express.Multer.File,
    config: DamApiConfig,
  ): Promise<any> {
    this.logger.debug(
      `Uploading file to resource - Resource ID: ${ref}, File: "${file.originalname}", Size: ${file.size} bytes, Type: ${file.mimetype}, User: ${config.user}`,
    );

    try {
      const params = {
        user: config.user,
        function: "upload_multipart",
        ref,
        no_exif: 1,
        revert: 0,
      };

      const stream = Readable.from(file.buffer);
      const formData = this.utilsService.createFormData(params, config);
      formData.append("file", stream, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const result = await this.httpService.makeRequest(
        config.damUrl,
        formData,
      );

      this.logger.log(
        `File uploaded successfully - Resource ID: ${ref}, File: "${file.originalname}", Size: ${file.size} bytes`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upload file - Resource ID: ${ref}, File: "${file.originalname}", Error: ${error.message}`,
      );
      throw new HttpException(
        "Error uploading file.",
        DamErrors.ERR_UPLOADING_FILE,
      );
    }
  }

  /**
   * Deletes a resource from the DAM system
   */
  async deleteResource(resource: string, config: DamApiConfig): Promise<any> {
    this.logger.log(
      `Deleting DAM resource - Resource: ${resource}, User: ${config.user}`,
    );

    try {
      const params = {
        user: config.user,
        function: "delete_resource",
        resource,
      };

      const formData = this.utilsService.createFormData(params, config);
      const result = await this.httpService.makeRequest(
        config.damUrl,
        formData,
      );

      this.logger.log(`Resource deleted successfully - Resource: ${resource}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete resource - Resource: ${resource}, Error: ${error.message}`,
      );
      throw new HttpException(
        "Error deleting resource.",
        DamErrors.ERR_DELETING_RESOURCE,
      );
    }
  }

  /**
   * Gets resource path with retry logic for file validation
   */
  async getResourcePathWithRetry(
    resource: string,
    config: DamApiConfig,
  ): Promise<DamFile[]> {
    this.logger.debug(
      `Getting DAM resource path with retry - Resource: ${resource}, User: ${config.user}`,
    );

    // First try with the main service
    let files = await this.getResourcePath(resource, config);
    if (
      this.utilsService.validateFileTypes(files, DAM_CONFIG.REQUIRED_SIZE_CODES)
    ) {
      this.logger.debug(
        `Resource files ready on first attempt - Resource: ${resource}, File count: ${files.length}`,
      );
      return files;
    }

    this.logger.debug(
      `Resource files not ready, using retry logic - Resource: ${resource}`,
    );

    // Use specialized validation client
    const validationClient = this.httpService.createValidationClient();

    try {
      const params = {
        user: config.user,
        function: "get_resource_all_image_sizes",
        resource,
      };
      const formData = this.utilsService.createFormData(params, config);

      const response = await validationClient.post(config.damUrl, formData, {
        headers: formData.getHeaders(),
        validateStatus: (status) => status < 500,
      });

      files = response.data;

      // Check if files are ready after each request
      if (
        !this.utilsService.validateFileTypes(
          files,
          DAM_CONFIG.REQUIRED_SIZE_CODES,
        )
      ) {
        this.logger.debug(
          `Files not ready, triggering retry - Resource: ${resource}, File count: ${files.length}`,
        );
        const error = new Error("FILES_NOT_READY");
        error.message = "FILES_NOT_READY";
        throw error;
      }

      this.logger.debug(
        `Resource files ready after retry - Resource: ${resource}, File count: ${files.length}`,
      );

      return files;
    } catch (error) {
      if (error.message === "FILES_NOT_READY") {
        this.logger.error(
          `File validation failed after all retries - Resource: ${resource}, Max retries: ${DAM_CONFIG.RETRY_ATTEMPTS}, Reason: Required file variants not processed within timeout`,
        );
        throw new HttpException(
          "File processing timeout: Image variants not ready",
          DamErrors.ERR_FILE_PROCESSING_TIMEOUT,
        );
      }

      this.logger.error(
        `Error getting resource images with retry - Resource: ${resource}, Error: ${error.message}, Error type: ${error.constructor.name}`,
      );

      throw new HttpException(
        "Error getting resource images with retry.",
        DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      );
    }
  }
}
