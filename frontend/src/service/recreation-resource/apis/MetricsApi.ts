/* tslint:disable */
/* eslint-disable */
/**
 * Recreation Sites and Trails BC API
 * RST API documentation
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from '../runtime';

/**
 *
 */
export class MetricsApi extends runtime.BaseAPI {
  /**
   */
  async metricsControllerGetMetricsRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/api/metrics`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   */
  async metricsControllerGetMetrics(
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.metricsControllerGetMetricsRaw(initOverrides);
  }
}
