import { HttpException, Injectable } from "@nestjs/common";
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
}

@Injectable()
export class DamApiService {
  private readonly damUrl: string;
  private readonly privateKey: string;
  private readonly user: string;
  private readonly pdfCollectionId: string;
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.damUrl = `${process.env.DAM_URL}/api/?`;
    this.privateKey = process.env.DAM_PRIVATE_KEY ?? "";
    this.user = process.env.DAM_USER ?? "";
    this.pdfCollectionId = process.env.DAM_RST_PDF_COLLECTION_ID ?? "";

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
        console.log(
          `Retrying DAM API request (${retryCount}/3): ${requestConfig.url}`,
        );
      },
    });
  }

  private sign(query: string): string {
    return createHash("sha256")
      .update(`${this.privateKey}${query}`)
      .digest("hex");
  }

  private createFormData(params: Record<string, any>): FormData {
    const queryString = new URLSearchParams(params).toString();
    const signature = this.sign(queryString);
    const formData = new FormData();
    formData.append("query", queryString);
    formData.append("sign", signature);
    formData.append("user", this.user);
    return formData;
  }

  private async makeRequest(formData: FormData): Promise<any> {
    try {
      const response = await this.axiosInstance.post(this.damUrl, formData, {
        headers: formData.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("DAM API request failed:", error.message);
      throw error;
    }
  }

  /**
   * Creates a new resource in the Digital Asset Management (DAM) system.
   * @param title The title of the resource to create.
   */
  async createResource(title: string): Promise<string> {
    try {
      const params = {
        user: this.user,
        function: "create_resource",
        metadata: JSON.stringify({ title }),
        resource_type: 1,
        archive: 0,
      };
      const formData = this.createFormData(params);
      return await this.makeRequest(formData);
    } catch (error) {
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
    try {
      const params = {
        user: this.user,
        function: "get_resource_all_image_sizes",
        resource,
      };
      const formData = this.createFormData(params);
      return await this.makeRequest(formData);
    } catch (error) {
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
   * @param checkFileTypes Function to validate if all required file types are present.
   */
  async getResourcePathWithRetry(
    resource: string,
    checkFileTypes: (files: any[]) => boolean,
  ): Promise<any[]> {
    // First try with the main axios retry configuration
    let files = await this.getResourcePath(resource);
    if (checkFileTypes(files)) {
      return files;
    }

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
        console.log(
          `Retrying file validation (${retryCount}/3): waiting for files to be processed`,
        );
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
      if (!checkFileTypes(files)) {
        // Create a custom error that will trigger retry
        const error = new Error("FILES_NOT_READY");
        error.message = "FILES_NOT_READY";
        throw error;
      }

      return files;
    } catch (error) {
      if (error.message === "FILES_NOT_READY") {
        throw new HttpException("Server error: File images not found", 500);
      }
      throw new HttpException(
        "Error getting resource images with retry.",
        DamErrors.ERR_GETTING_RESOURCE_IMAGES,
      );
    }
  }

  /**
   * Adds a resource to a collection.
   * @param resource The resource ID to add to collection.
   */
  async addResourceToCollection(resource: string): Promise<any> {
    try {
      const params = {
        user: this.user,
        function: "add_resource_to_collection",
        resource,
        collection: this.pdfCollectionId,
      };
      const formData = this.createFormData(params);
      return await this.makeRequest(formData);
    } catch (error) {
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

      return await this.makeRequest(formData);
    } catch (error) {
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
    try {
      const params = {
        user: this.user,
        function: "delete_resource",
        resource,
      };
      const formData = this.createFormData(params);
      return await this.makeRequest(formData);
    } catch (error) {
      throw new HttpException(
        "Error deleting resource.",
        DamErrors.ERR_DELETING_RESOURCE,
      );
    }
  }
}
