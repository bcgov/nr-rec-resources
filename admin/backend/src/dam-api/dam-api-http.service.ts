import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import crypto from 'crypto';
import FormData from 'form-data';
import { DamApiUtilsService } from './dam-api-utils.service';
import { DAM_CONFIG } from './dam-api.types';

/**
 * Low-level HTTP client service for DAM API communication
 */
@Injectable()
export class DamApiHttpService {
  private readonly logger = new Logger(DamApiHttpService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly damApiUtilsService: DamApiUtilsService) {
    this.axiosInstance = this.createAxiosInstance();
  }

  /**
   * Creates and configures an axios instance with retry logic
   */
  private createAxiosInstance(
    validateResponse?: (data: any) => boolean,
  ): AxiosInstance {
    const instance = axios.create({
      timeout: DAM_CONFIG.HTTP_TIMEOUT,
    });

    const retryConfig: IAxiosRetryConfig = {
      retries: DAM_CONFIG.RETRY_ATTEMPTS,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: this.getRetryCondition(),
      onRetry: this.getOnRetryHandler(),
    };

    if (validateResponse) {
      retryConfig.validateResponse = ({ data }) => validateResponse(data);
    }

    axiosRetry(instance, retryConfig);
    return instance;
  }

  /**
   * Gets the retry condition function
   */
  private getRetryCondition() {
    return (error: any) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        axiosRetry.isRetryableError(error)
      );
    };
  }

  /**
   * Gets the onRetry handler function
   */
  private getOnRetryHandler() {
    return (retryCount: number, error: any, requestConfig: any) => {
      const message = requestConfig.url?.includes('validation')
        ? `Retrying DAM API request with validation - Attempt: ${retryCount}/${DAM_CONFIG.RETRY_ATTEMPTS}, URL: ${requestConfig.url}, Error: ${error.message}`
        : `Retrying DAM API request - Attempt: ${retryCount}/${DAM_CONFIG.RETRY_ATTEMPTS}, URL: ${requestConfig.url}, Error: ${error.message}`;

      this.logger.warn(message);
    };
  }

  /**
   * Makes a POST request to the DAM API
   */
  private async executeRequest(
    damUrl: string,
    formData: FormData,
    axiosInstance: AxiosInstance,
  ): Promise<any> {
    const startTime = Date.now();
    const requestId = crypto.randomBytes(6).toString('hex');

    this.logger.debug(`[${requestId}] Making DAM API request to ${damUrl}`);

    // Convert FormData to buffer to avoid stream consumption issues during retries
    const formDataBuffer =
      await this.damApiUtilsService.formDataToBuffer(formData);
    const headers = formData.getHeaders();

    const response = await axiosInstance.post(damUrl, formDataBuffer, {
      headers,
    });

    const duration = Date.now() - startTime;
    this.logger.debug(
      `[${requestId}] DAM API request successful - Duration: ${duration}ms, Status: ${response.status}`,
    );

    return response.data;
  }

  /**
   * Makes a POST request to the DAM API with form data
   */
  async makeRequest(damUrl: string, formData: FormData): Promise<any> {
    return this.executeRequest(damUrl, formData, this.axiosInstance);
  }

  /**
   * Makes a POST request with custom validation logic for retries
   */
  async makeRequestWithValidation<T>(
    damUrl: string,
    formData: FormData,
    validateResponse: (data: T) => boolean,
  ): Promise<any> {
    const customAxios = this.createAxiosInstance(validateResponse);
    return this.executeRequest(damUrl, formData, customAxios);
  }
}
