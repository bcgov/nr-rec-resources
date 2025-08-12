import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Readable } from "stream";
import { DamApiHttpService } from "./dam-api-http.service";
import { DamApiUtilsService } from "./dam-api-utils.service";
import { DAM_CONFIG, DamApiConfig, DamErrors, DamFile } from "./dam-api.types";
import { DamMetadataDto } from "./dto/dam-metadata.dto";

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
    metadata: DamMetadataDto,
    resourceType: "pdf" | "image",
    config: DamApiConfig,
  ): Promise<string> {
    const params = {
      user: config.user,
      function: "create_resource",
      metadata: JSON.stringify(metadata),
      resource_type: this.getResourceTypeId(resourceType, config),
      archive: 0,
    };

    const logContext = `DAM resource creation parameters - Title: "${metadata.title}", Type: ${resourceType}, Resource Type: ${resourceType}, User: ${config.user}`;

    return this.executeRequest(
      params,
      config,
      "Creating DAM resource",
      DamErrors.ERR_CREATING_RESOURCE,
      logContext,
    );
  }

  /**
   * Gets all image sizes for a resource
   */
  async getResourcePath(
    resource: string,
    config: DamApiConfig,
  ): Promise<DamFile[]> {
    const params = {
      user: config.user,
      function: "get_resource_all_image_sizes",
      resource,
    };

    const logContext = `Resource: ${resource}, User: ${config.user}`;

    return this.executeRequest(
      params,
      config,
      "Getting DAM resource path",
      DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      logContext,
    );
  }

  /**
   * Adds a resource to a collection
   */
  async addResourceToCollection(
    resource: string,
    collectionType: "pdf" | "image",
    config: DamApiConfig,
  ): Promise<any> {
    const params = {
      user: config.user,
      function: "add_resource_to_collection",
      resource,
      collection: this.getCollectionId(collectionType, config),
    };

    const logContext = `Resource: ${resource}, Collection Type: ${collectionType}, User: ${config.user}`;

    return this.executeRequest(
      params,
      config,
      "Adding resource to collection",
      DamErrors.ERR_ADDING_RESOURCE_TO_COLLECTION,
      logContext,
    );
  }

  /**
   * Uploads a file to a resource
   */
  async uploadFile(
    ref: string,
    file: Express.Multer.File,
    config: DamApiConfig,
  ): Promise<any> {
    const logContext = `Resource ID: ${ref}, File: "${file.originalname}", Size: ${file.size} bytes, Type: ${file.mimetype}, User: ${config.user}`;
    this.logger.debug(`Uploading file to resource - ${logContext}`);

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
      this.logger.log(`File uploaded successfully - ${logContext}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upload file - ${logContext}, Error: ${error.message}`,
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
    const params = {
      user: config.user,
      function: "delete_resource",
      resource,
    };

    const logContext = `Resource: ${resource}, User: ${config.user}`;

    return this.executeRequest(
      params,
      config,
      "Deleting DAM resource",
      DamErrors.ERR_DELETING_RESOURCE,
      logContext,
    );
  }

  /**
   * Gets resource path with retry logic for file validation
   */
  async getResourcePathWithRetry(
    resource: string,
    config: DamApiConfig,
  ): Promise<DamFile[]> {
    const params = {
      user: config.user,
      function: "get_resource_all_image_sizes",
      resource,
    };

    const validateFileTypes = (data: DamFile[]): boolean => {
      return this.utilsService.validateFileTypes(
        data,
        DAM_CONFIG.REQUIRED_SIZE_CODES,
      );
    };

    const logContext = `Resource: ${resource}`;

    return this.executeRequestWithValidation(
      params,
      config,
      validateFileTypes,
      "Getting DAM resource path",
      DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      DamErrors.ERR_FILE_PROCESSING_TIMEOUT,
      logContext,
    );
  }

  /**
   * Executes a DAM API request with standardized error handling
   */
  private async executeRequest<T = any>(
    params: Record<string, any>,
    config: DamApiConfig,
    operation: string,
    errorCode: DamErrors,
    logContext?: string,
  ): Promise<T> {
    this.logger.debug(`Executing ${operation} - ${logContext}`);

    try {
      const formData = this.utilsService.createFormData(params, config);
      const result = await this.httpService.makeRequest(
        config.damUrl,
        formData,
      );

      this.logger.log(`${operation} completed successfully - ${logContext}`);
      return result;
    } catch (error) {
      this.logger.error(
        `${operation} failed - ${logContext}, Error: ${error.message}`,
      );
      throw new HttpException(`Error ${operation.toLowerCase()}.`, errorCode);
    }
  }

  /**
   * Executes a DAM API request with validation and retry logic
   */
  private async executeRequestWithValidation<T = any>(
    params: Record<string, any>,
    config: DamApiConfig,
    validateFn: (data: T) => boolean,
    operation: string,
    errorCode: DamErrors,
    timeoutErrorCode: DamErrors,
    logContext?: string,
  ): Promise<T> {
    this.logger.debug(`Executing ${operation} with validation - ${logContext}`);

    try {
      const formData = this.utilsService.createFormData(params, config);
      const result = await this.httpService.makeRequestWithValidation<T>(
        config.damUrl,
        formData,
        validateFn,
      );

      this.logger.debug(
        `${operation} with validation completed - ${logContext}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `${operation} with validation failed - ${logContext}, Error: ${error.message}`,
      );

      // Check if it's a file validation timeout vs other errors
      const isFileValidationError =
        error.message.includes("Custom validation failed") ||
        error.message.includes("required variants not ready");

      throw new HttpException(
        isFileValidationError
          ? "File processing timeout: Image variants not ready"
          : `Error ${operation.toLowerCase()} with retry.`,
        isFileValidationError ? timeoutErrorCode : errorCode,
      );
    }
  }

  /**
   * Gets the appropriate resource type ID based on type
   */
  private getResourceTypeId(
    resourceType: "pdf" | "image",
    config: DamApiConfig,
  ): number {
    return resourceType === "image"
      ? config.imageResourceType
      : config.pdfResourceType;
  }

  /**
   * Gets the appropriate collection ID based on type
   */
  private getCollectionId(
    collectionType: "pdf" | "image",
    config: DamApiConfig,
  ): string {
    return collectionType === "image"
      ? config.imageCollectionId
      : config.pdfCollectionId;
  }
}
