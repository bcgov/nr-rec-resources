import { HttpException, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import crypto from "crypto";
import FormData from "form-data";
import { DAM_CONFIG, DamErrors } from "./dam-api.types";

/**
 * Low-level HTTP client service for DAM API communication
 */
@Injectable()
export class DamApiHttpService {
  private readonly logger = new Logger(DamApiHttpService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    // Create axios instance with retry configuration
    this.axiosInstance = axios.create({
      timeout: DAM_CONFIG.HTTP_TIMEOUT,
    });

    // Configure axios retry
    axiosRetry(this.axiosInstance, {
      retries: DAM_CONFIG.RETRY_ATTEMPTS,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return !!(
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          axiosRetry.isRetryableError(error)
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.warn(
          `Retrying DAM API request - Attempt: ${retryCount}/${DAM_CONFIG.RETRY_ATTEMPTS}, URL: ${requestConfig.url}, Error: ${error.message}`,
        );
      },
    });
  }

  /**
   * Makes a POST request to the DAM API with form data
   */
  async makeRequest(damUrl: string, formData: FormData): Promise<any> {
    const startTime = Date.now();
    const requestId = crypto.randomBytes(6).toString("hex");

    this.logger.debug(`[${requestId}] Making DAM API request to ${damUrl}`);

    try {
      const response = await this.axiosInstance.post(damUrl, formData, {
        headers: formData.getHeaders(),
      });

      const duration = Date.now() - startTime;
      this.logger.debug(
        `[${requestId}] DAM API request successful - Duration: ${duration}ms, Status: ${response.status}`,
      );

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorInfo = `RequestId: ${requestId}, Duration: ${duration}ms, Error: ${error.message}, Status: ${error.response?.status || "N/A"}, URL: ${damUrl}, IsTimeout: ${error.code === "ECONNABORTED"}, IsNetworkError: ${!error.response}`;

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
   * Creates a specialized axios instance for file validation with custom retry logic
   */
  createValidationClient(): AxiosInstance {
    const validationAxios = axios.create({
      timeout: DAM_CONFIG.HTTP_TIMEOUT,
    });

    axiosRetry(validationAxios, {
      retries: DAM_CONFIG.RETRY_ATTEMPTS,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return !!(
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          axiosRetry.isRetryableError(error) ||
          error.message === "FILES_NOT_READY"
        );
      },
      onRetry: (retryCount) => {
        this.logger.debug(`Retrying file validation`, {
          attempt: `${retryCount}/${DAM_CONFIG.RETRY_ATTEMPTS}`,
          reason: "waiting for files to be processed",
        });
      },
    });

    return validationAxios;
  }
}
