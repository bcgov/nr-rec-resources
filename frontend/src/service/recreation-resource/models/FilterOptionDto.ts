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
 * @interface FilterOptionDto
 */
export interface FilterOptionDto {
  /**
   * Unique identifier for the filter option
   * @type {string}
   * @memberof FilterOptionDto
   */
  id: string;
  /**
   * Number of matching results for this filter
   * @type {number}
   * @memberof FilterOptionDto
   */
  count: number;
  /**
   * Human-readable display text for the filter option
   * @type {string}
   * @memberof FilterOptionDto
   */
  description: string;
}

/**
 * Check if a given object implements the FilterOptionDto interface.
 */
export function instanceOfFilterOptionDto(
  value: object,
): value is FilterOptionDto {
  if (!('id' in value) || value['id'] === undefined) return false;
  if (!('count' in value) || value['count'] === undefined) return false;
  if (!('description' in value) || value['description'] === undefined)
    return false;
  return true;
}

export function FilterOptionDtoFromJSON(json: any): FilterOptionDto {
  return FilterOptionDtoFromJSONTyped(json, false);
}

export function FilterOptionDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): FilterOptionDto {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'],
    count: json['count'],
    description: json['description'],
  };
}

export function FilterOptionDtoToJSON(json: any): FilterOptionDto {
  return FilterOptionDtoToJSONTyped(json, false);
}

export function FilterOptionDtoToJSONTyped(
  value?: FilterOptionDto | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    id: value['id'],
    count: value['count'],
    description: value['description'],
  };
}
