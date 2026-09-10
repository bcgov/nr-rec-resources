# AssetsApi

All URIs are relative to _http://localhost_

| Method                                                                                                      | HTTP request                                 | Description                                                 |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| [**bulkCreateRecreationAssets**](AssetsApi.md#bulkcreaterecreationassets)                                   | **POST** /api/v1/assets/bulk-create          | Bulk create multiple recreation assets in a single request  |
| [**bulkInsertAssetRepairs**](AssetsApi.md#bulkinsertassetrepairs)                                           | **POST** /api/v1/assets/bulk-repairs         | Bulk create repairs across multiple recreation assets       |
| [**bulkUpdateRecreationAssets**](AssetsApi.md#bulkupdaterecreationassets)                                   | **PATCH** /api/v1/assets/bulk-update         | Bulk update common fields across multiple recreation assets |
| [**createAssetRepair**](AssetsApi.md#createassetrepair)                                                     | **POST** /api/v1/assets/{id}/repairs         | Create a repair record for an asset                         |
| [**createRecreationAsset**](AssetsApi.md#createrecreationasset)                                             | **POST** /api/v1/assets                      | Create a new recreation asset                               |
| [**deleteAssetRepair**](AssetsApi.md#deleteassetrepair)                                                     | **DELETE** /api/v1/assets/repairs/{repairId} | Delete a repair record                                      |
| [**deleteRecreationAsset**](AssetsApi.md#deleterecreationasset)                                             | **DELETE** /api/v1/assets/{id}               | Delete a recreation asset                                   |
| [**getAssetRepairs**](AssetsApi.md#getassetrepairs)                                                         | **GET** /api/v1/assets/{id}/repairs          | Get all repair records for an asset                         |
| [**getPaginatedRecreationAssets**](AssetsApi.md#getpaginatedrecreationassets)                               | **GET** /api/v1/assets                       | Retrieve recreation assets with filtering and pagination    |
| [**getRecreationAssetById**](AssetsApi.md#getrecreationassetbyid)                                           | **GET** /api/v1/assets/{id}                  | Find a recreation asset by ID                               |
| [**recreationAssetControllerFindAllAssetCodes**](AssetsApi.md#recreationassetcontrollerfindallassetcodes)   | **GET** /api/v1/assets/codes                 | Retrieve all recreation asset type codes                    |
| [**recreationAssetControllerFindAllRepairCodes**](AssetsApi.md#recreationassetcontrollerfindallrepaircodes) | **GET** /api/v1/assets/repair-codes          | Retrieve all recreation asset repair codes                  |
| [**updateAssetRepair**](AssetsApi.md#updateassetrepair)                                                     | **PATCH** /api/v1/assets/repairs/{repairId}  | Update a repair record                                      |
| [**updateRecreationAsset**](AssetsApi.md#updaterecreationasset)                                             | **PATCH** /api/v1/assets/{id}                | Update an existing recreation asset                         |

## bulkCreateRecreationAssets

> Array&lt;RecreationAssetDto&gt;
> bulkCreateRecreationAssets(bulkCreateRecreationAssetsDto)

Bulk create multiple recreation assets in a single request

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { BulkCreateRecreationAssetsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // BulkCreateRecreationAssetsDto
    bulkCreateRecreationAssetsDto: ...,
  } satisfies BulkCreateRecreationAssetsRequest;

  try {
    const data = await api.bulkCreateRecreationAssets(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                              | Type                                                              | Description | Notes |
| --------------------------------- | ----------------------------------------------------------------- | ----------- | ----- |
| **bulkCreateRecreationAssetsDto** | [BulkCreateRecreationAssetsDto](BulkCreateRecreationAssetsDto.md) |             |       |

### Return type

[**Array&lt;RecreationAssetDto&gt;**](RecreationAssetDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## bulkInsertAssetRepairs

> bulkInsertAssetRepairs(recreationAssetBulkRepairDto)

Bulk create repairs across multiple recreation assets

Applies a common repair code and completion date across multiple grouped asset
IDs with varying costs.

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { BulkInsertAssetRepairsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // RecreationAssetBulkRepairDto
    recreationAssetBulkRepairDto: ...,
  } satisfies BulkInsertAssetRepairsRequest;

  try {
    const data = await api.bulkInsertAssetRepairs(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                             | Type                                                            | Description | Notes |
| -------------------------------- | --------------------------------------------------------------- | ----------- | ----- |
| **recreationAssetBulkRepairDto** | [RecreationAssetBulkRepairDto](RecreationAssetBulkRepairDto.md) |             |       |

### Return type

`void` (Empty response body)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                           | Response headers |
| ----------- | ----------------------------------------------------- | ---------------- |
| **200**     | Bulk repairs applied successfully.                    | -                |
| **400**     | Invalid payload structure or missing required fields. | -                |
| **404**     | One or more provided asset_ids do not exist.          | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## bulkUpdateRecreationAssets

> BulkAssetUpdateResponseDto
> bulkUpdateRecreationAssets(recreationAssetBulkUpdateDto)

Bulk update common fields across multiple recreation assets

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { BulkUpdateRecreationAssetsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // RecreationAssetBulkUpdateDto
    recreationAssetBulkUpdateDto: ...,
  } satisfies BulkUpdateRecreationAssetsRequest;

  try {
    const data = await api.bulkUpdateRecreationAssets(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                             | Type                                                            | Description | Notes |
| -------------------------------- | --------------------------------------------------------------- | ----------- | ----- |
| **recreationAssetBulkUpdateDto** | [RecreationAssetBulkUpdateDto](RecreationAssetBulkUpdateDto.md) |             |       |

### Return type

[**BulkAssetUpdateResponseDto**](BulkAssetUpdateResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                  | Response headers |
| ----------- | ---------------------------- | ---------------- |
| **200**     | Assets updated successfully. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## createAssetRepair

> RecreationAssetRepairDto createAssetRepair(id, createRecreationAssetRepairDto)

Create a repair record for an asset

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { CreateAssetRepairRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Asset ID
    id: 8.14,
    // CreateRecreationAssetRepairDto
    createRecreationAssetRepairDto: ...,
  } satisfies CreateAssetRepairRequest;

  try {
    const data = await api.createAssetRepair(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                               | Type                                                                | Description | Notes                     |
| ---------------------------------- | ------------------------------------------------------------------- | ----------- | ------------------------- |
| **id**                             | `number`                                                            | Asset ID    | [Defaults to `undefined`] |
| **createRecreationAssetRepairDto** | [CreateRecreationAssetRepairDto](CreateRecreationAssetRepairDto.md) |             |                           |

### Return type

[**RecreationAssetRepairDto**](RecreationAssetRepairDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## createRecreationAsset

> RecreationAssetDto createRecreationAsset(createRecreationAssetDto)

Create a new recreation asset

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { CreateRecreationAssetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // CreateRecreationAssetDto
    createRecreationAssetDto: ...,
  } satisfies CreateRecreationAssetRequest;

  try {
    const data = await api.createRecreationAsset(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description | Notes |
| ---------------------------- | ------------------------------------------------------- | ----------- | ----- |
| **createRecreationAssetDto** | [CreateRecreationAssetDto](CreateRecreationAssetDto.md) |             |       |

### Return type

[**RecreationAssetDto**](RecreationAssetDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteAssetRepair

> deleteAssetRepair(repairId)

Delete a repair record

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { DeleteAssetRepairRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Repair ID
    repairId: 8.14,
  } satisfies DeleteAssetRepairRequest;

  try {
    const data = await api.deleteAssetRepair(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name         | Type     | Description | Notes                     |
| ------------ | -------- | ----------- | ------------------------- |
| **repairId** | `number` | Repair ID   | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **204**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteRecreationAsset

> deleteRecreationAsset(id)

Delete a recreation asset

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { DeleteRecreationAssetRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Asset ID
    id: 8.14,
  } satisfies DeleteRecreationAssetRequest;

  try {
    const data = await api.deleteRecreationAsset(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name   | Type     | Description | Notes                     |
| ------ | -------- | ----------- | ------------------------- |
| **id** | `number` | Asset ID    | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **204**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getAssetRepairs

> Array&lt;RecreationAssetRepairDto&gt; getAssetRepairs(id)

Get all repair records for an asset

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { GetAssetRepairsRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Asset ID
    id: 8.14,
  } satisfies GetAssetRepairsRequest;

  try {
    const data = await api.getAssetRepairs(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name   | Type     | Description | Notes                     |
| ------ | -------- | ----------- | ------------------------- |
| **id** | `number` | Asset ID    | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationAssetRepairDto&gt;**](RecreationAssetRepairDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getPaginatedRecreationAssets

> PaginatedRecreationAssetDto getPaginatedRecreationAssets(page, limit,
> parentId, assetTag, recResourceId, assetCode, assetName, legacyStructureId,
> minActualValue, maxActualValue, includeRepair)

Retrieve recreation assets with filtering and pagination

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { GetPaginatedRecreationAssetsRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Page number (1-indexed) (optional)
    page: 8.14,
    // number | Number of items per page (optional)
    limit: 8.14,
    // number | Filter by exact Parent ID (optional)
    parentId: 8.14,
    // string | Filter by asset tag (contains) (optional)
    assetTag: assetTag_example,
    // string | Filter by recreation resource ID (optional)
    recResourceId: recResourceId_example,
    // number | Filter by asset code (optional)
    assetCode: 8.14,
    // string | Filter by asset name (contains) (optional)
    assetName: assetName_example,
    // string | Filter by legacy structure ID (optional)
    legacyStructureId: legacyStructureId_example,
    // number | Filter by min actual value (optional)
    minActualValue: 8.14,
    // number | Filter by max actual value (optional)
    maxActualValue: 8.14,
    // boolean | Include repair records in the asset response (optional)
    includeRepair: true,
  } satisfies GetPaginatedRecreationAssetsRequest;

  try {
    const data = await api.getPaginatedRecreationAssets(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                  | Type      | Description                                  | Notes                                |
| --------------------- | --------- | -------------------------------------------- | ------------------------------------ |
| **page**              | `number`  | Page number (1-indexed)                      | [Optional] [Defaults to `1`]         |
| **limit**             | `number`  | Number of items per page                     | [Optional] [Defaults to `10`]        |
| **parentId**          | `number`  | Filter by exact Parent ID                    | [Optional] [Defaults to `undefined`] |
| **assetTag**          | `string`  | Filter by asset tag (contains)               | [Optional] [Defaults to `undefined`] |
| **recResourceId**     | `string`  | Filter by recreation resource ID             | [Optional] [Defaults to `undefined`] |
| **assetCode**         | `number`  | Filter by asset code                         | [Optional] [Defaults to `undefined`] |
| **assetName**         | `string`  | Filter by asset name (contains)              | [Optional] [Defaults to `undefined`] |
| **legacyStructureId** | `string`  | Filter by legacy structure ID                | [Optional] [Defaults to `undefined`] |
| **minActualValue**    | `number`  | Filter by min actual value                   | [Optional] [Defaults to `undefined`] |
| **maxActualValue**    | `number`  | Filter by max actual value                   | [Optional] [Defaults to `undefined`] |
| **includeRepair**     | `boolean` | Include repair records in the asset response | [Optional] [Defaults to `undefined`] |

### Return type

[**PaginatedRecreationAssetDto**](PaginatedRecreationAssetDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationAssetById

> RecreationAssetDto getRecreationAssetById(id, includeRepair)

Find a recreation asset by ID

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { GetRecreationAssetByIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Asset ID
    id: 8.14,
    // boolean | Include repair records (optional)
    includeRepair: true,
  } satisfies GetRecreationAssetByIdRequest;

  try {
    const data = await api.getRecreationAssetById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type      | Description            | Notes                                |
| ----------------- | --------- | ---------------------- | ------------------------------------ |
| **id**            | `number`  | Asset ID               | [Defaults to `undefined`]            |
| **includeRepair** | `boolean` | Include repair records | [Optional] [Defaults to `undefined`] |

### Return type

[**RecreationAssetDto**](RecreationAssetDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## recreationAssetControllerFindAllAssetCodes

> Array&lt;RecreationAssetCodeDto&gt;
> recreationAssetControllerFindAllAssetCodes()

Retrieve all recreation asset type codes

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { RecreationAssetControllerFindAllAssetCodesRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  try {
    const data = await api.recreationAssetControllerFindAllAssetCodes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;RecreationAssetCodeDto&gt;**](RecreationAssetCodeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## recreationAssetControllerFindAllRepairCodes

> Array&lt;RecreationRepairCodeDto&gt;
> recreationAssetControllerFindAllRepairCodes()

Retrieve all recreation asset repair codes

### Example

```ts
import { Configuration, AssetsApi } from '';
import type { RecreationAssetControllerFindAllRepairCodesRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AssetsApi(config);

  try {
    const data = await api.recreationAssetControllerFindAllRepairCodes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;RecreationRepairCodeDto&gt;**](RecreationRepairCodeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateAssetRepair

> RecreationAssetRepairDto updateAssetRepair(repairId,
> updateRecreationAssetRepairDto)

Update a repair record

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { UpdateAssetRepairRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Repair ID
    repairId: 8.14,
    // UpdateRecreationAssetRepairDto
    updateRecreationAssetRepairDto: ...,
  } satisfies UpdateAssetRepairRequest;

  try {
    const data = await api.updateAssetRepair(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                               | Type                                                                | Description | Notes                     |
| ---------------------------------- | ------------------------------------------------------------------- | ----------- | ------------------------- |
| **repairId**                       | `number`                                                            | Repair ID   | [Defaults to `undefined`] |
| **updateRecreationAssetRepairDto** | [UpdateRecreationAssetRepairDto](UpdateRecreationAssetRepairDto.md) |             |                           |

### Return type

[**RecreationAssetRepairDto**](RecreationAssetRepairDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateRecreationAsset

> RecreationAssetDto updateRecreationAsset(id, updateRecreationAssetDto)

Update an existing recreation asset

### Example

```ts
import {
  Configuration,
  AssetsApi,
} from '';
import type { UpdateRecreationAssetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AssetsApi(config);

  const body = {
    // number | Asset ID
    id: 8.14,
    // UpdateRecreationAssetDto
    updateRecreationAssetDto: ...,
  } satisfies UpdateRecreationAssetRequest;

  try {
    const data = await api.updateRecreationAsset(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description | Notes                     |
| ---------------------------- | ------------------------------------------------------- | ----------- | ------------------------- |
| **id**                       | `number`                                                | Asset ID    | [Defaults to `undefined`] |
| **updateRecreationAssetDto** | [UpdateRecreationAssetDto](UpdateRecreationAssetDto.md) |             |                           |

### Return type

[**RecreationAssetDto**](RecreationAssetDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
