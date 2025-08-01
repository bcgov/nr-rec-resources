import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import FormData from "form-data";
import { DamApiConfig, DamFile } from "./dam-api.types";

/**
 * Utility service for DAM API operations like signing, form data creation, etc.
 */
@Injectable()
export class DamApiUtilsService {
  private readonly logger = new Logger(DamApiUtilsService.name);

  /**
   * Signs a query string with the private key using SHA256
   */
  sign(query: string, privateKey: string): string {
    this.logger.debug(
      `Signing DAM API query - Length: ${query.length}, Has Private Key: ${!!privateKey}`,
    );

    return createHash("sha256").update(`${privateKey}${query}`).digest("hex");
  }

  /**
   * Creates FormData with signed parameters for DAM API requests
   */
  createFormData(params: Record<string, any>, config: DamApiConfig): FormData {
    this.logger.debug(
      `Creating form data - Parameters: [${Object.keys(params).join(", ")}], User: ${config.user}`,
    );

    const queryString = new URLSearchParams(params).toString();
    const signature = this.sign(queryString, config.privateKey);
    const formData = new FormData();

    formData.append("query", queryString);
    formData.append("sign", signature);
    formData.append("user", config.user);

    this.logger.debug(
      `Form data created - Query Length: ${queryString.length}, Has Signature: ${!!signature}, User: ${config.user}`,
    );

    return formData;
  }

  /**
   * Validates if all required file types are present after DAM processing
   */
  validateFileTypes(
    files: DamFile[],
    requiredSizes: readonly string[],
  ): boolean {
    if (!Array.isArray(files)) {
      this.logger.warn(`Invalid files array received - Type: ${typeof files}`);
      return false;
    }

    // get list of size codes
    const availableSizeCodes = new Set(files.map((f) => f.size_code));

    const isValid = requiredSizes
      .map((size_code) => availableSizeCodes.has(size_code))
      .every(Boolean);

    const availableSizesList = Array.from(availableSizeCodes).join(", ");

    this.logger.debug(
      `File types validation - Total: ${files.length}, Available: [${availableSizesList}], Required: [${requiredSizes.join(", ")}], Valid: ${isValid}`,
    );

    return isValid;
  }
}
