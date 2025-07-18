/* tslint:disable */
/* eslint-disable */
/**
 * Recreation Sites and Trails BC Admin API
 * RST Admin API documentation
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from "../runtime";
/**
 *
 * @export
 * @interface CreateRecreationResourceDocBodyDto
 */
export interface CreateRecreationResourceDocBodyDto {
  /**
   * Doc title
   * @type {string}
   * @memberof CreateRecreationResourceDocBodyDto
   */
  title: string;
}

/**
 * Check if a given object implements the CreateRecreationResourceDocBodyDto interface.
 */
export function instanceOfCreateRecreationResourceDocBodyDto(
  value: object,
): value is CreateRecreationResourceDocBodyDto {
  if (!("title" in value) || value["title"] === undefined) return false;
  return true;
}

export function CreateRecreationResourceDocBodyDtoFromJSON(
  json: any,
): CreateRecreationResourceDocBodyDto {
  return CreateRecreationResourceDocBodyDtoFromJSONTyped(json, false);
}

export function CreateRecreationResourceDocBodyDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CreateRecreationResourceDocBodyDto {
  if (json == null) {
    return json;
  }
  return {
    title: json["title"],
  };
}

export function CreateRecreationResourceDocBodyDtoToJSON(
  json: any,
): CreateRecreationResourceDocBodyDto {
  return CreateRecreationResourceDocBodyDtoToJSONTyped(json, false);
}

export function CreateRecreationResourceDocBodyDtoToJSONTyped(
  value?: CreateRecreationResourceDocBodyDto | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    title: value["title"],
  };
}
