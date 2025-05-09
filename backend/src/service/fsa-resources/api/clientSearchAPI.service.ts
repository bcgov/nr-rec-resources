/* tslint:disable */
/* eslint-disable */
/**
 * FSA Forest Client API
 * Forest Client API Application - Version 302
 *
 * The version of the OpenAPI document: 302
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Injectable, Optional } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { Observable, from, of, switchMap } from "rxjs";
import { ClientPublicViewDto } from "../model/clientPublicViewDto";
import { Configuration } from "../configuration";
import { COLLECTION_FORMATS } from "../variables";

@Injectable()
export class ClientSearchAPIService {
  protected basePath = process.env.FOREST_CLIENT_API_URL;
  public defaultHeaders: Record<string, string> = {};
  public configuration = new Configuration();
  protected httpClient: HttpService;

  constructor(
    httpClient: HttpService,
    @Optional() configuration: Configuration,
  ) {
    this.configuration = configuration || this.configuration;
    this.basePath = configuration?.basePath || this.basePath;
    this.httpClient = configuration?.httpClient || httpClient;
  }

  /**
   * @param consumes string[] mime-types
   * @return true: consumes contains 'multipart/form-data', false: otherwise
   */
  private canConsumeForm(consumes: string[]): boolean {
    const form = "multipart/form-data";
    return consumes.includes(form);
  }

  /**
   * Search for clients
   * Search for clients based on the provided parameters. It uses a fuzzy match to search for the client name. The cutout for the fuzzy match is 0.8. The search is case insensitive.
   * @param xAPIKEY API Key used for authentication
   * @param page The one index page number, defaults to 0
   * @param size The amount of data to be returned per page, defaults to 10
   * @param name The name of the client you\&#39;re searching
   * @param acronym The acronym of the client you\&#39;re searching
   * @param number The number of the client you\&#39;re searching
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public searchByAcronymNameNumber(
    xAPIKEY: string,
    page?: number,
    size?: number,
    name?: string,
    acronym?: string,
    number?: string,
  ): Observable<AxiosResponse<Array<ClientPublicViewDto>>>;
  public searchByAcronymNameNumber(
    xAPIKEY: string,
    page?: number,
    size?: number,
    name?: string,
    acronym?: string,
    number?: string,
  ): Observable<any> {
    if (xAPIKEY === null || xAPIKEY === undefined) {
      throw new Error(
        "Required parameter xAPIKEY was null or undefined when calling searchByAcronymNameNumber.",
      );
    }

    let queryParameters = new URLSearchParams();
    if (page !== undefined && page !== null) {
      queryParameters.append("page", <any>page);
    }
    if (size !== undefined && size !== null) {
      queryParameters.append("size", <any>size);
    }
    if (name !== undefined && name !== null) {
      queryParameters.append("name", <any>name);
    }
    if (acronym !== undefined && acronym !== null) {
      queryParameters.append("acronym", <any>acronym);
    }
    if (number !== undefined && number !== null) {
      queryParameters.append("number", <any>number);
    }

    let headers = { ...this.defaultHeaders };
    if (xAPIKEY !== undefined && xAPIKEY !== null) {
      headers["X-API-KEY"] = String(xAPIKEY);
    }

    let accessTokenObservable: Observable<any> = of(null);

    // to determine the Accept header
    let httpHeaderAccepts: string[] = ["application/json"];
    const httpHeaderAcceptSelected: string | undefined =
      this.configuration.selectHeaderAccept(httpHeaderAccepts);
    if (httpHeaderAcceptSelected != undefined) {
      headers["Accept"] = httpHeaderAcceptSelected;
    }

    // to determine the Content-Type header
    const consumes: string[] = [];
    return accessTokenObservable.pipe(
      switchMap((accessToken) => {
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return this.httpClient.get<Array<ClientPublicViewDto>>(
          `${this.basePath}/api/clients/search/by`,
          {
            params: queryParameters,
            withCredentials: this.configuration.withCredentials,
            headers: headers,
          },
        );
      }),
    );
  }
  /**
   * Search for clients
   * Search for clients based on the provided client IDs
   * @param xAPIKEY API Key used for authentication
   * @param page The one index page number, defaults to 0
   * @param size The amount of data to be returned per page, defaults to 10
   * @param id Id of the client you\&#39;re searching
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public searchClients(
    xAPIKEY: string,
    page?: number,
    size?: number,
    id?: Array<string>,
  ): Observable<AxiosResponse<Array<ClientPublicViewDto>>>;
  public searchClients(
    xAPIKEY: string,
    page?: number,
    size?: number,
    id?: Array<string>,
  ): Observable<any> {
    if (xAPIKEY === null || xAPIKEY === undefined) {
      throw new Error(
        "Required parameter xAPIKEY was null or undefined when calling searchClients.",
      );
    }

    let queryParameters = new URLSearchParams();
    if (page !== undefined && page !== null) {
      queryParameters.append("page", <any>page);
    }
    if (size !== undefined && size !== null) {
      queryParameters.append("size", <any>size);
    }
    if (id) {
      id.forEach((element) => {
        queryParameters.append("id", <any>element);
      });
    }

    let headers = { ...this.defaultHeaders };
    if (xAPIKEY !== undefined && xAPIKEY !== null) {
      headers["X-API-KEY"] = String(xAPIKEY);
    }

    let accessTokenObservable: Observable<any> = of(null);

    // to determine the Accept header
    let httpHeaderAccepts: string[] = ["application/json"];
    const httpHeaderAcceptSelected: string | undefined =
      this.configuration.selectHeaderAccept(httpHeaderAccepts);
    if (httpHeaderAcceptSelected != undefined) {
      headers["Accept"] = httpHeaderAcceptSelected;
    }

    // to determine the Content-Type header
    const consumes: string[] = [];
    return accessTokenObservable.pipe(
      switchMap((accessToken) => {
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return this.httpClient.get<Array<ClientPublicViewDto>>(
          `${this.basePath}/api/clients/search`,
          {
            params: queryParameters,
            withCredentials: this.configuration.withCredentials,
            headers: headers,
          },
        );
      }),
    );
  }
}
