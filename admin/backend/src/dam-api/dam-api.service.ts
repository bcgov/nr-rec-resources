import { AppConfigService } from "@/app-config/app-config.service";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { createHash } from "crypto";
import FormData from "form-data";
import { Readable } from "stream";

enum DamErrors {
  ERR_CREATING_RESOURCE = 416,
  ERR_GETTING_RESOURCE_IMAGES = 417,
  ERR_ADDING_RESOURCE_TO_COLLECTION = 418,
  ERR_UPLOADING_FILE = 419,
  ERR_DELETING_RESOURCE = 420,
  ERR_SERVICE_UNAVAILABLE = 421,
  ERR_INVALID_CONFIGURATION = 422,
  ERR_FILE_PROCESSING_TIMEOUT = 423,
}

@Injectable()
export class DamApiService {
  private readonly logger = new Logger(DamApiService.name);
  private readonly damUrl: string;
  private readonly privateKey: string;
  private readonly user: string;
  private readonly pdfCollectionId: string;
  private readonly imageCollectionId: string;
  private readonly pdfResourceType: number;
  private readonly imageResourceType: number;
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly appConfig: AppConfigService) {
    this.damUrl = `${this.appConfig.damUrl}/api/?`;
    this.privateKey = this.appConfig.damPrivateKey;
    this.user = this.appConfig.damUser;
    this.pdfCollectionId = this.appConfig.damRstPdfCollectionId;
    this.imageCollectionId = this.appConfig.damRstImageCollectionId;
    this.pdfResourceType = this.appConfig.damResourceTypePdf;
    this.imageResourceType = this.appConfig.damResourceTypeImage;

    this.logger.log(
      `DAM API Service initialized - User: ${this.user}, URL: ${this.appConfig.damUrl}, PDF Collection: ${this.pdfCollectionId}, Image Collection: ${this.imageCollectionId}, PDF Type: ${this.pdfResourceType}, Image Type: ${this.imageResourceType}`,
    );

    // Create axios instance with retry configuration
    this.axiosInstance = axios.create({
      timeout: 30000, // 30 seconds timeout
    });

    // Configure axios retry
    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors, timeout, 5xx status codes, or 429 (Too Many Requests)
        return !!(
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          axiosRetry.isRetryableError
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.warn(
          `Retrying DAM API request - Attempt: ${retryCount}/3, URL: ${requestConfig.url}, Error: ${error.message}`,
        );
      },
    });
  }

  private sign(query: string): string {
    this.logger.debug(
      `Signing DAM API query - Length: ${query.length}, Has Private Key: ${!!this.privateKey}`,
    );

    return createHash("sha256")
      .update(`${this.privateKey}${query}`)
      .digest("hex");
  }

  private createFormData(params: Record<string, any>): FormData {
    this.logger.debug(
      `Creating form data - Parameters: [${Object.keys(params).join(", ")}], User: ${this.user}`,
    );

    const queryString = new URLSearchParams(params).toString();
    const signature = this.sign(queryString);
    const formData = new FormData();
    formData.append("query", queryString);
    formData.append("sign", signature);
    formData.append("user", this.user);

    this.logger.debug(
      `Form data created - Query Length: ${queryString.length}, Has Signature: ${!!signature}, User: ${this.user}`,
    );

    return formData;
  }

  private async makeRequest(formData: FormData): Promise<any> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    this.logger.debug(
      `[${requestId}] Making DAM API request to ${this.damUrl}`,
    );

    try {
      const response = await this.axiosInstance.post(this.damUrl, formData, {
        headers: formData.getHeaders(),
      });

      const duration = Date.now() - startTime;
      this.logger.debug(
        `[${requestId}] DAM API request successful - Duration: ${duration}ms, Status: ${response.status}`,
      );

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorInfo = `RequestId: ${requestId}, Duration: ${duration}ms, Error: ${error.message}, Status: ${error.response?.status || "N/A"}, URL: ${this.damUrl}, IsTimeout: ${error.code === "ECONNABORTED"}, IsNetworkError: ${!error.response}`;

      this.logger.error(`[${requestId}] DAM API request failed - ${errorInfo}`);

      // Enhance error with more context for upstream handling
      if (error.response?.status >= 500) {
        throw new HttpException(
          `DAM service unavailable: ${error.message}`,
          DamErrors.ERR_SERVICE_UNAVAILABLE,
        );
      }

      throw error;
    }
  }

  /**
   * Creates a new resource in the Digital Asset Management (DAM) system.
   * @param title The title of the resource to create.
   * @param resourceType The type of resource ('pdf' or 'image').
   */
  async createResource(
    title: string,
    resourceType: "pdf" | "image" = "pdf",
  ): Promise<string> {
    this.logger.log(
      `Creating DAM resource - Title: "${title}", Type: ${resourceType}`,
    );

    try {
      const resource_type =
        resourceType === "image"
          ? this.imageResourceType
          : this.pdfResourceType;
      const params = {
        user: this.user,
        function: "create_resource",
        metadata: JSON.stringify({ title }),
        resource_type,
        archive: 0,
      };

      this.logger.debug(
        `DAM resource creation parameters - Title: "${title}", Type: ${resourceType}, ResourceType: ${resource_type}, User: ${this.user}`,
      );

      const formData = this.createFormData(params);
      const result = await this.makeRequest(formData);

      this.logger.log(
        `DAM resource created successfully - Title: "${title}", Type: ${resourceType}, ID: ${result}`,
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
   * Gets all image sizes for a resource.
   * @param resource The resource ID to get images for.
   */
  async getResourcePath(resource: string): Promise<any[]> {
    this.logger.debug(`Getting DAM resource path`, { resource });

    try {
      const params = {
        user: this.user,
        function: "get_resource_all_image_sizes",
        resource,
      };
      const formData = this.createFormData(params);
      const result = await this.makeRequest(formData);

      this.logger.debug(`DAM resource path retrieved`, {
        resource,
        pathCount: Array.isArray(result) ? result.length : "unknown",
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to get DAM resource path`, {
        resource,
        error: error.message,
      });
      throw new HttpException(
        "Error getting resource images.",
        DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      );
    }
  }

  /**
   * Gets all image sizes for a resource with built-in retry logic for file validation.
   * This method retries the getResourcePath call until all required file types are available.
   * @param resource The resource ID to get images for.
   */
  async getResourcePathWithRetry(resource: string): Promise<any[]> {
    this.logger.debug(`Getting DAM resource path with retry`, { resource });

    // First try with the main axios retry configuration
    let files = await this.getResourcePath(resource);
    if (this.checkFileTypes(files)) {
      this.logger.debug(`Resource files ready on first attempt`, {
        resource,
        fileCount: files.length,
      });
      return files;
    }

    this.logger.debug(`Resource files not ready, using retry logic`, {
      resource,
    });

    // Create a custom axios instance for file validation with specific retry logic
    const validationAxios = axios.create({
      timeout: 30000,
    });

    // Configure retry specifically for file validation
    axiosRetry(validationAxios, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry if we get a "files not ready" error, network error, 5xx, or 429 (Too Many Requests)
        return !!(
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          axiosRetry.isRetryableError ||
          error.message === "FILES_NOT_READY"
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.debug(`Retrying file validation`, {
          attempt: `${retryCount}/3`,
          resource,
          reason: "waiting for files to be processed",
        });
      },
    });

    try {
      const params = {
        user: this.user,
        function: "get_resource_all_image_sizes",
        resource,
      };
      const formData = this.createFormData(params);

      const response = await validationAxios.post(this.damUrl, formData, {
        headers: formData.getHeaders(),
        validateStatus: (status) => {
          // Accept all status codes so we can handle validation ourselves
          return status < 500;
        },
      });

      files = response.data;

      // Check if files are ready after each request
      if (!this.checkFileTypes(files)) {
        this.logger.debug(`Files not ready, triggering retry`, {
          resource,
          fileCount: files.length,
        });
        // Create a custom error that will trigger retry
        const error = new Error("FILES_NOT_READY");
        error.message = "FILES_NOT_READY";
        throw error;
      }

      this.logger.debug(`Resource files ready after retry`, {
        resource,
        fileCount: files.length,
      });

      return files;
    } catch (error) {
      if (error.message === "FILES_NOT_READY") {
        this.logger.error(`File validation failed after all retries`, {
          resource,
          maxRetries: 3,
          reason: "Required file variants not processed within timeout",
        });
        throw new HttpException(
          "File processing timeout: Image variants not ready",
          DamErrors.ERR_FILE_PROCESSING_TIMEOUT,
        );
      }

      this.logger.error(`Error getting resource images with retry`, {
        resource,
        error: error.message,
        errorType: error.constructor.name,
      });

      throw new HttpException(
        "Error getting resource images with retry.",
        DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      );
    }
  }

  /**
   * Adds a resource to a collection.
   * @param resource The resource ID to add to collection.
   * @param collectionType The type of collection ('pdf' or 'image').
   */
  async addResourceToCollection(
    resource: string,
    collectionType: "pdf" | "image" = "pdf",
  ): Promise<any> {
    this.logger.debug(`Adding resource to collection`, {
      resource,
      collectionType,
    });

    try {
      const collectionId =
        collectionType === "image"
          ? this.imageCollectionId
          : this.pdfCollectionId;

      this.logger.debug(`Collection mapping`, {
        collectionType,
        collectionId,
      });

      const params = {
        user: this.user,
        function: "add_resource_to_collection",
        resource,
        collection: collectionId,
      };
      const formData = this.createFormData(params);
      const result = await this.makeRequest(formData);

      this.logger.log(`Resource added to collection successfully`, {
        resource,
        collectionType,
        collectionId,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to add resource to collection`, {
        resource,
        collectionType,
        error: error.message,
      });
      throw new HttpException(
        "Error adding resource to collection.",
        DamErrors.ERR_ADDING_RESOURCE_TO_COLLECTION,
      );
    }
  }

  /**
   * Uploads a file to a resource.
   * @param ref The resource reference ID.
   * @param file The file to upload.
   */
  async uploadFile(ref: string, file: Express.Multer.File): Promise<any> {
    this.logger.debug(
      `Uploading file to resource - ResourceID: ${ref}, File: ${file.originalname} (${file.size} bytes, ${file.mimetype})`,
    );

    try {
      const params = {
        user: this.user,
        function: "upload_multipart",
        ref,
        no_exif: 1,
        revert: 0,
      };
      const stream = Readable.from(file.buffer);
      const formData = this.createFormData(params);
      formData.append("file", stream, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const result = await this.makeRequest(formData);

      this.logger.log(
        `File uploaded successfully - ResourceID: ${ref}, File: ${file.originalname} (${file.size} bytes)`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upload file - ResourceID: ${ref}, File: ${file.originalname}, Error: ${error.message}`,
      );
      throw new HttpException(
        "Error uploading file.",
        DamErrors.ERR_UPLOADING_FILE,
      );
    }
  }

  /**
   * Deletes a resource from the DAM system.
   * @param resource The resource ID to delete.
   */
  async deleteResource(resource: string): Promise<any> {
    this.logger.log(`Deleting DAM resource`, { resource });

    try {
      const params = {
        user: this.user,
        function: "delete_resource",
        resource,
      };
      const formData = this.createFormData(params);
      const result = await this.makeRequest(formData);

      this.logger.log(`Resource deleted successfully`, { resource });

      return result;
    } catch (error) {
      this.logger.error(`Failed to delete resource`, {
        resource,
        error: error.message,
      });
      throw new HttpException(
        "Error deleting resource.",
        DamErrors.ERR_DELETING_RESOURCE,
      );
    }
  }

  /**
   * Creates a resource, uploads a file, adds to collection and returns the processed files.
   * This is a high-level method that encapsulates the complete workflow for uploading documents.
   * @param title The title of the resource to create.
   * @param file The file to upload.
   * @returns Promise containing an object with ref_id and files array.
   */
  async createAndUploadDocument(
    title: string,
    file: Express.Multer.File,
  ): Promise<{ ref_id: string; files: any[] }> {
    this.logger.log(`Creating and uploading document`, {
      title,
      fileName: file.originalname,
      fileSize: file.size,
    });

    try {
      const ref_id = await this.createResource(title, "pdf");
      await this.uploadFile(ref_id, file);
      await this.addResourceToCollection(ref_id, "pdf");
      const files = await this.getResourcePath(ref_id);

      this.logger.log(`Document created and uploaded successfully`, {
        title,
        ref_id,
        fileName: file.originalname,
        fileCount: files.length,
      });

      return { ref_id, files };
    } catch (error) {
      this.logger.error(`Failed to create and upload document`, {
        title,
        fileName: file.originalname,
        error: error.message,
      });
      throw new HttpException(
        "Error creating and uploading document.",
        DamErrors.ERR_UPLOADING_FILE,
      );
    }
  }

  /**
   * Creates a resource, uploads an image file, adds to collection and returns the processed files with variants.
   * This is a high-level method that encapsulates the complete workflow for uploading images.
   * @param caption The caption/title of the image resource to create.
   * @param file The image file to upload.
   * @returns Promise containing an object with ref_id and files array.
   */
  async createAndUploadImage(
    caption: string,
    file: Express.Multer.File,
  ): Promise<{ ref_id: string; files: any[] }> {
    this.logger.log(`Creating and uploading image`, {
      caption,
      fileName: file.originalname,
      fileSize: file.size,
    });

    try {
      const ref_id = await this.createResource(caption, "image");
      await this.uploadFile(ref_id, file);
      await this.addResourceToCollection(ref_id, "image");
      const files = await this.getResourcePath(ref_id);

      this.logger.log(`Image created and uploaded successfully`, {
        caption,
        ref_id,
        fileName: file.originalname,
        fileCount: files.length,
      });

      return { ref_id, files };
    } catch (error) {
      this.logger.error(`Failed to create and upload image`, {
        caption,
        fileName: file.originalname,
        error: error.message,
      });
      throw new HttpException(
        "Error creating and uploading image.",
        DamErrors.ERR_UPLOADING_FILE,
      );
    }
  }

  /**
   * Creates a resource, uploads an image file with retry logic for file processing,
   * adds to collection and returns the processed files with variants.
   * This method includes built-in retry logic to wait for all image variants to be processed.
   * @param caption The caption/title of the image resource to create.
   * @param file The image file to upload.
   * @returns Promise containing an object with ref_id and files array.
   */
  async createAndUploadImageWithRetry(
    caption: string,
    file: Express.Multer.File,
  ): Promise<{ ref_id: string; files: any[] }> {
    this.logger.log(
      `Creating and uploading image with retry - Caption: "${caption}", File: ${file.originalname} (${file.size} bytes)`,
    );

    try {
      const ref_id = await this.createResource(caption, "image");
      await this.uploadFile(ref_id, file);
      await this.addResourceToCollection(ref_id, "image");
      const files = await this.getResourcePathWithRetry(ref_id);

      this.logger.log(
        `Image created and uploaded with retry successfully - Caption: "${caption}", ID: ${ref_id}, File: ${file.originalname}, Variants: ${files.length}`,
      );

      return { ref_id, files };
    } catch (error) {
      this.logger.error(
        `Failed to create and upload image with retry - Caption: "${caption}", File: ${file.originalname}, Error: ${error.message}`,
      );
      throw new HttpException(
        "Error creating and uploading image with retry.",
        DamErrors.ERR_UPLOADING_FILE,
      );
    }
  }

  /**
   * Validates if all required file types are present after DAM processing.
   * Checks for original, thumbnail, screen, and preview variants.
   * @param files Array of file objects from DAM API response.
   * @returns boolean indicating if all required file types are available.
   */
  private checkFileTypes(files: any[]): boolean {
    if (!Array.isArray(files)) {
      this.logger.warn(`Invalid files array received - Type: ${typeof files}`);
      return false;
    }

    const requiredSizes = ["original", "thm", "scr", "pre"];
    const availableSizes = files.filter(
      (f: any) =>
        f.size_code === "original" ||
        f.size_code === "thm" ||
        f.size_code === "scr" ||
        f.size_code === "pre",
    );

    const isValid = availableSizes.length >= 3;
    const availableSizesList = availableSizes
      .map((f) => f.size_code)
      .join(", ");

    this.logger.debug(
      `File types validation - Total: ${files.length}, Available: [${availableSizesList}], Required: [${requiredSizes.join(", ")}], Valid: ${isValid}, MinRequired: 3`,
    );

    return isValid;
  }
}
