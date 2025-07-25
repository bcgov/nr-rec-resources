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

import { mapValues } from '../runtime';
/**
 *
 * @export
 * @interface RecreationResourceDistrictDto
 */
export interface RecreationResourceDistrictDto {
  /**
   * Unique identifier for the recreation district
   * @type {string}
   * @memberof RecreationResourceDistrictDto
   */
  district_code: string;
  /**
   * Name of the recreation district
   * @type {string}
   * @memberof RecreationResourceDistrictDto
   */
  description: string;
}

/**
 * Check if a given object implements the RecreationResourceDistrictDto interface.
 */
export function instanceOfRecreationResourceDistrictDto(
  value: object,
): value is RecreationResourceDistrictDto {
  if (!('district_code' in value) || value['district_code'] === undefined)
    return false;
  if (!('description' in value) || value['description'] === undefined)
    return false;
  return true;
}

export function RecreationResourceDistrictDtoFromJSON(
  json: any,
): RecreationResourceDistrictDto {
  return RecreationResourceDistrictDtoFromJSONTyped(json, false);
}

export function RecreationResourceDistrictDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): RecreationResourceDistrictDto {
  if (json == null) {
    return json;
  }
  return {
    district_code: json['district_code'],
    description: json['description'],
  };
}

export function RecreationResourceDistrictDtoToJSON(
  json: any,
): RecreationResourceDistrictDto {
  return RecreationResourceDistrictDtoToJSONTyped(json, false);
}

export function RecreationResourceDistrictDtoToJSONTyped(
  value?: RecreationResourceDistrictDto | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    district_code: value['district_code'],
    description: value['description'],
  };
}
