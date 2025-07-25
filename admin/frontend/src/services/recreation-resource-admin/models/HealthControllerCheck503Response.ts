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
import type { HealthControllerCheck200ResponseInfoValue } from "./HealthControllerCheck200ResponseInfoValue";
import {
  HealthControllerCheck200ResponseInfoValueFromJSON,
  HealthControllerCheck200ResponseInfoValueFromJSONTyped,
  HealthControllerCheck200ResponseInfoValueToJSON,
  HealthControllerCheck200ResponseInfoValueToJSONTyped,
} from "./HealthControllerCheck200ResponseInfoValue";

/**
 *
 * @export
 * @interface HealthControllerCheck503Response
 */
export interface HealthControllerCheck503Response {
  /**
   *
   * @type {string}
   * @memberof HealthControllerCheck503Response
   */
  status?: string;
  /**
   *
   * @type {{ [key: string]: HealthControllerCheck200ResponseInfoValue; }}
   * @memberof HealthControllerCheck503Response
   */
  info?: { [key: string]: HealthControllerCheck200ResponseInfoValue } | null;
  /**
   *
   * @type {{ [key: string]: HealthControllerCheck200ResponseInfoValue; }}
   * @memberof HealthControllerCheck503Response
   */
  error?: { [key: string]: HealthControllerCheck200ResponseInfoValue } | null;
  /**
   *
   * @type {{ [key: string]: HealthControllerCheck200ResponseInfoValue; }}
   * @memberof HealthControllerCheck503Response
   */
  details?: { [key: string]: HealthControllerCheck200ResponseInfoValue };
}

/**
 * Check if a given object implements the HealthControllerCheck503Response interface.
 */
export function instanceOfHealthControllerCheck503Response(
  value: object,
): value is HealthControllerCheck503Response {
  return true;
}

export function HealthControllerCheck503ResponseFromJSON(
  json: any,
): HealthControllerCheck503Response {
  return HealthControllerCheck503ResponseFromJSONTyped(json, false);
}

export function HealthControllerCheck503ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): HealthControllerCheck503Response {
  if (json == null) {
    return json;
  }
  return {
    status: json["status"] == null ? undefined : json["status"],
    info:
      json["info"] == null
        ? undefined
        : mapValues(
            json["info"],
            HealthControllerCheck200ResponseInfoValueFromJSON,
          ),
    error:
      json["error"] == null
        ? undefined
        : mapValues(
            json["error"],
            HealthControllerCheck200ResponseInfoValueFromJSON,
          ),
    details:
      json["details"] == null
        ? undefined
        : mapValues(
            json["details"],
            HealthControllerCheck200ResponseInfoValueFromJSON,
          ),
  };
}

export function HealthControllerCheck503ResponseToJSON(
  json: any,
): HealthControllerCheck503Response {
  return HealthControllerCheck503ResponseToJSONTyped(json, false);
}

export function HealthControllerCheck503ResponseToJSONTyped(
  value?: HealthControllerCheck503Response | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    status: value["status"],
    info:
      value["info"] == null
        ? undefined
        : mapValues(
            value["info"],
            HealthControllerCheck200ResponseInfoValueToJSON,
          ),
    error:
      value["error"] == null
        ? undefined
        : mapValues(
            value["error"],
            HealthControllerCheck200ResponseInfoValueToJSON,
          ),
    details:
      value["details"] == null
        ? undefined
        : mapValues(
            value["details"],
            HealthControllerCheck200ResponseInfoValueToJSON,
          ),
  };
}
