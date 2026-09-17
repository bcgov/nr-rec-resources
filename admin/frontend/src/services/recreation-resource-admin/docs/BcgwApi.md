# BcgwApi

All URIs are relative to _http://localhost_

| Method                                                                          | HTTP request                                   | Description                                                |
| ------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| [**getBcgwClosuresFullyAttributed**](BcgwApi.md#getbcgwclosuresfullyattributed) | **GET** /api/v1/bcgw/closures-fully-attributed | Get all recreation resources for BCGW ingestion            |
| [**getBcgwClosuresShort**](BcgwApi.md#getbcgwclosuresshort)                     | **GET** /api/v1/bcgw/closures-short            | Get recreation resources for the short closures BCGW layer |
| [**getBcgwRecreationLines**](BcgwApi.md#getbcgwrecreationlines)                 | **GET** /api/v1/bcgw/recreation-lines          | Get recreation line features for BCGW ingestion            |
| [**getBcgwRecreationPolygons**](BcgwApi.md#getbcgwrecreationpolygons)           | **GET** /api/v1/bcgw/recreation-polygons       | Get recreation polygon features for BCGW ingestion         |

## getBcgwClosuresFullyAttributed

> BcgwFeatureCollectionDto getBcgwClosuresFullyAttributed(page)

Get all recreation resources for BCGW ingestion

Returns a paginated GeoJSON FeatureCollection of recreation resources intended
for ingestion by the BC Geographic Warehouse (BCGW) into the
WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_FA_SV layer. Data is sourced from a
pre-computed materialized view refreshed every 5 minutes.

### Example

```ts
import { Configuration, BcgwApi } from '';
import type { GetBcgwClosuresFullyAttributedRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: bcgw-keycloak application
    accessToken: 'YOUR ACCESS TOKEN',
  });
  const api = new BcgwApi(config);

  const body = {
    // number | Page number (1-indexed). Each page returns up to 1000 features. (optional)
    page: 8.14,
  } satisfies GetBcgwClosuresFullyAttributedRequest;

  try {
    const data = await api.getBcgwClosuresFullyAttributed(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type     | Description                                                     | Notes                                |
| -------- | -------- | --------------------------------------------------------------- | ------------------------------------ |
| **page** | `number` | Page number (1-indexed). Each page returns up to 1000 features. | [Optional] [Defaults to `undefined`] |

### Return type

[**BcgwFeatureCollectionDto**](BcgwFeatureCollectionDto.md)

### Authorization

[bcgw-keycloak application](../README.md#bcgw-keycloak-application)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                                                                                   | Response headers |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | GeoJSON FeatureCollection of recreation resources                                                                             | -                |
| **401**     | Unauthorized — missing, malformed, or expired bearer token. Obtain a token from CSS using the OAuth2 Client Credentials flow. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getBcgwClosuresShort

> BcgwClosuresShortFeatureCollectionDto getBcgwClosuresShort(page)

Get recreation resources for the short closures BCGW layer

Returns a paginated GeoJSON FeatureCollection of recreation resources intended
for ingestion by the BC Geographic Warehouse (BCGW) into the
WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_SV layer. A 20-column subset of the
fully attributed closures layer.

### Example

```ts
import { Configuration, BcgwApi } from '';
import type { GetBcgwClosuresShortRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const api = new BcgwApi();

  const body = {
    // number | Page number (1-indexed). Each page returns up to 1000 features. (optional)
    page: 8.14,
  } satisfies GetBcgwClosuresShortRequest;

  try {
    const data = await api.getBcgwClosuresShort(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type     | Description                                                     | Notes                                |
| -------- | -------- | --------------------------------------------------------------- | ------------------------------------ |
| **page** | `number` | Page number (1-indexed). Each page returns up to 1000 features. | [Optional] [Defaults to `undefined`] |

### Return type

[**BcgwClosuresShortFeatureCollectionDto**](BcgwClosuresShortFeatureCollectionDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                       | Response headers |
| ----------- | ------------------------------------------------- | ---------------- |
| **200**     | GeoJSON FeatureCollection of recreation resources | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getBcgwRecreationLines

> BcgwRecreationLinesFeatureCollectionDto getBcgwRecreationLines(page)

Get recreation line features for BCGW ingestion

Returns a paginated GeoJSON FeatureCollection of recreation trail/line features
intended for ingestion by the BC Geographic Warehouse (BCGW) into the
WHSE_FOREST_TENURE.FTEN_RECREATION_LINES_SVW layer. Data is sourced from a
pre-computed materialized view refreshed every 5 minutes.

### Example

```ts
import { Configuration, BcgwApi } from '';
import type { GetBcgwRecreationLinesRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const api = new BcgwApi();

  const body = {
    // number | Page number (1-indexed). Each page returns up to 1000 features. (optional)
    page: 8.14,
  } satisfies GetBcgwRecreationLinesRequest;

  try {
    const data = await api.getBcgwRecreationLines(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type     | Description                                                     | Notes                                |
| -------- | -------- | --------------------------------------------------------------- | ------------------------------------ |
| **page** | `number` | Page number (1-indexed). Each page returns up to 1000 features. | [Optional] [Defaults to `undefined`] |

### Return type

[**BcgwRecreationLinesFeatureCollectionDto**](BcgwRecreationLinesFeatureCollectionDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                           | Response headers |
| ----------- | ----------------------------------------------------- | ---------------- |
| **200**     | GeoJSON FeatureCollection of recreation line features | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getBcgwRecreationPolygons

> BcgwRecreationPolygonsFeatureCollectionDto getBcgwRecreationPolygons(page)

Get recreation polygon features for BCGW ingestion

Returns a paginated GeoJSON FeatureCollection of recreation polygon features
intended for ingestion by the BC Geographic Warehouse (BCGW) into the
WHSE_FOREST_TENURE.FTEN_RECREATION_POLY_SVW layer. Data is sourced from a
pre-computed materialized view refreshed every 5 minutes.

### Example

```ts
import { Configuration, BcgwApi } from '';
import type { GetBcgwRecreationPolygonsRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const api = new BcgwApi();

  const body = {
    // number | Page number (1-indexed). Each page returns up to 1000 features. (optional)
    page: 8.14,
  } satisfies GetBcgwRecreationPolygonsRequest;

  try {
    const data = await api.getBcgwRecreationPolygons(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type     | Description                                                     | Notes                                |
| -------- | -------- | --------------------------------------------------------------- | ------------------------------------ |
| **page** | `number` | Page number (1-indexed). Each page returns up to 1000 features. | [Optional] [Defaults to `undefined`] |

### Return type

[**BcgwRecreationPolygonsFeatureCollectionDto**](BcgwRecreationPolygonsFeatureCollectionDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | GeoJSON FeatureCollection of recreation polygon features | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
