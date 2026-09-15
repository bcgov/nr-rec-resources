# RecreationResourcesApi

All URIs are relative to _http://localhost_

| Method                                                                                                   | HTTP request                                                                                | Description                                                     |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [**createEstablishmentOrderDoc**](RecreationResourcesApi.md#createestablishmentorderdoc)                 | **POST** /api/v1/recreation-resources/{rec_resource_id}/establishment-order-docs            | Create a new establishment order document                       |
| [**createImageConsent**](RecreationResourcesApi.md#createimageconsent)                                   | **POST** /api/v1/recreation-resources/{rec_resource_id}/images/{image_id}/consent           | Create consent metadata for an existing image                   |
| [**createRecreationResourceFee**](RecreationResourcesApi.md#createrecreationresourcefee)                 | **POST** /api/v1/recreation-resources/{rec_resource_id}/fees                                | Create a new fee for a recreation resource                      |
| [**createTrail**](RecreationResourcesApi.md#createtrail)                                                 | **POST** /api/v1/recreation-resources/{rec_resource_id}/trails                              | Create a new trail for a recreation resource                    |
| [**deleteDocumentResource**](RecreationResourcesApi.md#deletedocumentresource)                           | **DELETE** /api/v1/recreation-resources/{rec_resource_id}/docs/{document_id}                | Delete a Document Resource                                      |
| [**deleteEstablishmentOrderDoc**](RecreationResourcesApi.md#deleteestablishmentorderdoc)                 | **DELETE** /api/v1/recreation-resources/{rec_resource_id}/establishment-order-docs/{s3_key} | Delete an establishment order document                          |
| [**deleteExhibitADoc**](RecreationResourcesApi.md#deleteexhibitadoc)                                     | **DELETE** /api/v1/recreation-resources/{rec_resource_id}/exhibit-a-docs/{document_id}      | Delete an Exhibit A document                                    |
| [**deleteImageResource**](RecreationResourcesApi.md#deleteimageresource)                                 | **DELETE** /api/v1/recreation-resources/{rec_resource_id}/images/{image_id}                 | Delete an image Resource                                        |
| [**deleteRecreationResourceFee**](RecreationResourcesApi.md#deleterecreationresourcefee)                 | **DELETE** /api/v1/recreation-resources/{rec_resource_id}/fees/{fee_id}                     | Soft-delete an existing fee for a recreation resource           |
| [**deleteTrail**](RecreationResourcesApi.md#deletetrail)                                                 | **DELETE** /api/v1/recreation-resources/{rec_resource_id}/trails/{trail_id}                 | Delete a trail                                                  |
| [**downloadExportCsv**](RecreationResourcesApi.md#downloadexportcsv)                                     | **GET** /api/v1/recreation-resources/exports/download                                       | Download a CSV export dataset                                   |
| [**finalizeDocUpload**](RecreationResourcesApi.md#finalizedocupload)                                     | **POST** /api/v1/recreation-resources/{rec_resource_id}/docs/finalize                       | Finalize document upload and create database record             |
| [**finalizeExhibitAUpload**](RecreationResourcesApi.md#finalizeexhibitaupload)                           | **POST** /api/v1/recreation-resources/{rec_resource_id}/exhibit-a-docs/finalize             | Finalize Exhibit A document upload and create database record   |
| [**finalizeImageUpload**](RecreationResourcesApi.md#finalizeimageupload)                                 | **POST** /api/v1/recreation-resources/{rec_resource_id}/images/finalize                     | Finalize image upload and create database record                |
| [**getActivitiesByRecResourceId**](RecreationResourcesApi.md#getactivitiesbyrecresourceid)               | **GET** /api/v1/recreation-resources/{rec_resource_id}/activities                           | Get all activities related to the resource                      |
| [**getAllEstablishmentOrderDocs**](RecreationResourcesApi.md#getallestablishmentorderdocs)               | **GET** /api/v1/recreation-resources/{rec_resource_id}/establishment-order-docs             | Get all establishment order documents for a recreation resource |
| [**getAllExhibitADocs**](RecreationResourcesApi.md#getallexhibitadocs)                                   | **GET** /api/v1/recreation-resources/{rec_resource_id}/exhibit-a-docs                       | Get all Exhibit A documents for a recreation resource           |
| [**getConsentFormDownloadUrl**](RecreationResourcesApi.md#getconsentformdownloadurl)                     | **GET** /api/v1/recreation-resources/{rec_resource_id}/images/{image_id}/consent-download   | Get presigned URL for consent form download                     |
| [**getDocumentsByRecResourceId**](RecreationResourcesApi.md#getdocumentsbyrecresourceid)                 | **GET** /api/v1/recreation-resources/{rec_resource_id}/docs                                 | Get all documents related to the resource                       |
| [**getExportDatasets**](RecreationResourcesApi.md#getexportdatasets)                                     | **GET** /api/v1/recreation-resources/exports/datasets                                       | List CSV export datasets                                        |
| [**getExportPreview**](RecreationResourcesApi.md#getexportpreview)                                       | **GET** /api/v1/recreation-resources/exports/preview                                        | Preview a CSV export dataset                                    |
| [**getFeaturesByRecResourceId**](RecreationResourcesApi.md#getfeaturesbyrecresourceid)                   | **GET** /api/v1/recreation-resources/{rec_resource_id}/features                             | Get all features related to the resource                        |
| [**getImagesByRecResourceId**](RecreationResourcesApi.md#getimagesbyrecresourceid)                       | **GET** /api/v1/recreation-resources/{rec_resource_id}/images                               | Get all images related to the resource                          |
| [**getOptionsByType**](RecreationResourcesApi.md#getoptionsbytype)                                       | **GET** /api/v1/recreation-resources/options/{type}                                         | List all options for a type                                     |
| [**getOptionsByTypes**](RecreationResourcesApi.md#getoptionsbytypes)                                     | **GET** /api/v1/recreation-resources/options                                                | List options for multiple types                                 |
| [**getRecreationResourceAdvisories**](RecreationResourcesApi.md#getrecreationresourceadvisories)         | **GET** /api/v1/recreation-resources/{rec_resource_id}/advisories                           | Get advisories and closures for a recreation resource           |
| [**getRecreationResourceById**](RecreationResourcesApi.md#getrecreationresourcebyid)                     | **GET** /api/recreation-resources/{rec_resource_id}                                         | Find recreation resource by ID                                  |
| [**getRecreationResourceFees**](RecreationResourcesApi.md#getrecreationresourcefees)                     | **GET** /api/v1/recreation-resources/{rec_resource_id}/fees                                 | Get all fees for a recreation resource                          |
| [**getRecreationResourceGeospatial**](RecreationResourcesApi.md#getrecreationresourcegeospatial)         | **GET** /api/v1/recreation-resources/{rec_resource_id}/geospatial                           | Get geospatial data for a recreation resource                   |
| [**getRecreationResourceReservation**](RecreationResourcesApi.md#getrecreationresourcereservation)       | **GET** /api/v1/recreation-resources/{rec_resource_id}/reservation                          | Get reservation data for a recreation resource                  |
| [**getRecreationResourceSuggestions**](RecreationResourcesApi.md#getrecreationresourcesuggestions)       | **GET** /api/recreation-resources/suggestions                                               |                                                                 |
| [**getTrailsByRecResourceId**](RecreationResourcesApi.md#gettrailsbyrecresourceid)                       | **GET** /api/v1/recreation-resources/{rec_resource_id}/trails                               | Get all trails for a recreation resource                        |
| [**presignDocUpload**](RecreationResourcesApi.md#presigndocupload)                                       | **POST** /api/v1/recreation-resources/{rec_resource_id}/docs/presign                        | Request presigned URL for direct S3 document upload             |
| [**presignExhibitAUpload**](RecreationResourcesApi.md#presignexhibitaupload)                             | **POST** /api/v1/recreation-resources/{rec_resource_id}/exhibit-a-docs/presign              | Request presigned URL for direct S3 Exhibit A document upload   |
| [**presignImageUpload**](RecreationResourcesApi.md#presignimageupload)                                   | **POST** /api/v1/recreation-resources/{rec_resource_id}/images/presign                      | Request presigned URLs for direct S3 image variant upload       |
| [**searchRecreationResources**](RecreationResourcesApi.md#searchrecreationresources)                     | **GET** /api/recreation-resources/search                                                    | Search recreation resources for admin                           |
| [**updateActivities**](RecreationResourcesApi.md#updateactivities)                                       | **PUT** /api/v1/recreation-resources/{rec_resource_id}/activities                           | Update activities for a recreation resource                     |
| [**updateFeatures**](RecreationResourcesApi.md#updatefeatures)                                           | **PUT** /api/v1/recreation-resources/{rec_resource_id}/features                             | Update features for a recreation resource                       |
| [**updateImageConsent**](RecreationResourcesApi.md#updateimageconsent)                                   | **PATCH** /api/v1/recreation-resources/{rec_resource_id}/images/{image_id}/consent          | Update consent metadata for an existing image                   |
| [**updateRecreationResourceById**](RecreationResourcesApi.md#updaterecreationresourcebyid)               | **PUT** /api/recreation-resources/{rec_resource_id}                                         | Update recreation resource by ID                                |
| [**updateRecreationResourceFee**](RecreationResourcesApi.md#updaterecreationresourcefee)                 | **PUT** /api/v1/recreation-resources/{rec_resource_id}/fees/{fee_id}                        | Update an existing fee for a recreation resource                |
| [**updateRecreationResourceGeospatial**](RecreationResourcesApi.md#updaterecreationresourcegeospatial)   | **PUT** /api/v1/recreation-resources/{rec_resource_id}/geospatial                           | Update geospatial data for a recreation resource                |
| [**updateRecreationResourceReservation**](RecreationResourcesApi.md#updaterecreationresourcereservation) | **PUT** /api/v1/recreation-resources/{rec_resource_id}/reservation                          | Update reservation data for a recreation resource               |
| [**updateTrail**](RecreationResourcesApi.md#updatetrail)                                                 | **PUT** /api/v1/recreation-resources/{rec_resource_id}/trails/{trail_id}                    | Update an existing trail                                        |

## createEstablishmentOrderDoc

> EstablishmentOrderDocDto createEstablishmentOrderDoc(recResourceId, file,
> title)

Create a new establishment order document

Uploads a PDF document to S3 and creates a database record

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { CreateEstablishmentOrderDocRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
    // Blob
    file: BINARY_DATA_HERE,
    // string
    title: title_example,
  } satisfies CreateEstablishmentOrderDocRequest;

  try {
    const data = await api.createEstablishmentOrderDoc(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |
| **file**          | `Blob`   |                        | [Defaults to `undefined`] |
| **title**         | `string` |                        | [Defaults to `undefined`] |

### Return type

[**EstablishmentOrderDocDto**](EstablishmentOrderDocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                       | Response headers |
| ----------- | ------------------------------------------------- | ---------------- |
| **201**     | Establishment order document created successfully | -                |
| **400**     | Bad request                                       | -                |
| **401**     | Unauthorized                                      | -                |
| **404**     | Recreation resource not found                     | -                |
| **415**     | File type not allowed                             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## createImageConsent

> RecreationResourceImageDto createImageConsent(recResourceId, imageId,
> dateTaken, containsPii, photographerType, photographerName, consentForm,
> fileName)

Create consent metadata for an existing image

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { CreateImageConsentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
    // string | Image identifier (UUID)
    imageId: a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
    // string | Date the photo was taken (ISO date string) (optional)
    dateTaken: dateTaken_example,
    // boolean | Whether the image contains personally identifiable information (optional)
    containsPii: true,
    // string | Type of photographer (database code) (optional)
    photographerType: photographerType_example,
    // string | Name of the photographer for attribution (optional)
    photographerName: photographerName_example,
    // Blob | Consent form PDF file (optional)
    consentForm: BINARY_DATA_HERE,
    // string | Display name for the image (optional)
    fileName: fileName_example,
  } satisfies CreateImageConsentRequest;

  try {
    const data = await api.createImageConsent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                 | Type      | Description                                                    | Notes                                |
| -------------------- | --------- | -------------------------------------------------------------- | ------------------------------------ |
| **recResourceId**    | `string`  | Resource identifier                                            | [Defaults to `undefined`]            |
| **imageId**          | `string`  | Image identifier (UUID)                                        | [Defaults to `undefined`]            |
| **dateTaken**        | `string`  | Date the photo was taken (ISO date string)                     | [Optional] [Defaults to `undefined`] |
| **containsPii**      | `boolean` | Whether the image contains personally identifiable information | [Optional] [Defaults to `undefined`] |
| **photographerType** | `string`  | Type of photographer (database code)                           | [Optional] [Defaults to `undefined`] |
| **photographerName** | `string`  | Name of the photographer for attribution                       | [Optional] [Defaults to `undefined`] |
| **consentForm**      | `Blob`    | Consent form PDF file                                          | [Optional] [Defaults to `undefined`] |
| **fileName**         | `string`  | Display name for the image                                     | [Optional] [Defaults to `undefined`] |

### Return type

[**RecreationResourceImageDto**](RecreationResourceImageDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **201**     | Consent metadata created | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## createRecreationResourceFee

> RecreationFeeDto createRecreationResourceFee(recResourceId,
> createRecreationFeeDto)

Create a new fee for a recreation resource

Creates a new fee and associates it with the recreation resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { CreateRecreationResourceFeeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
    // CreateRecreationFeeDto | Fee data to create
    createRecreationFeeDto: ...,
  } satisfies CreateRecreationResourceFeeRequest;

  try {
    const data = await api.createRecreationResourceFee(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                       | Type                                                | Description            | Notes                     |
| -------------------------- | --------------------------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**          | `string`                                            | Recreation Resource ID | [Defaults to `undefined`] |
| **createRecreationFeeDto** | [CreateRecreationFeeDto](CreateRecreationFeeDto.md) | Fee data to create     |                           |

### Return type

[**RecreationFeeDto**](RecreationFeeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                            | Response headers |
| ----------- | ------------------------------------------------------ | ---------------- |
| **201**     | Fee created successfully                               | -                |
| **400**     | Bad Request - validation errors                        | -                |
| **404**     | Recreation resource or fee type not found              | -                |
| **409**     | Fee type and sub-type already exists for this resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## createTrail

> RecreationTrailDto createTrail(recResourceId, createTrailDto)

Create a new trail for a recreation resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { CreateTrailRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC160773,
    // CreateTrailDto
    createTrailDto: ...,
  } satisfies CreateTrailRequest;

  try {
    const data = await api.createTrail(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name               | Type                                | Description            | Notes                     |
| ------------------ | ----------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**  | `string`                            | Recreation Resource ID | [Defaults to `undefined`] |
| **createTrailDto** | [CreateTrailDto](CreateTrailDto.md) |                        |                           |

### Return type

[**RecreationTrailDto**](RecreationTrailDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                      | Response headers |
| ----------- | ------------------------------------------------ | ---------------- |
| **201**     | Trail created successfully                       | -                |
| **400**     | Invalid trail data or activity is not accessible | -                |
| **404**     | Resource not found                               | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteDocumentResource

> RecreationResourceDocDto deleteDocumentResource(recResourceId, documentId)

Delete a Document Resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { DeleteDocumentResourceRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204117,
    // string | Document identifier
    documentId: 11714,
  } satisfies DeleteDocumentResourceRequest;

  try {
    const data = await api.deleteDocumentResource(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description         | Notes                     |
| ----------------- | -------- | ------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier | [Defaults to `undefined`] |
| **documentId**    | `string` | Document identifier | [Defaults to `undefined`] |

### Return type

[**RecreationResourceDocDto**](RecreationResourceDocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Document Deleted                       | -                |
| **404**     | Recreation Resource document not found | -                |
| **420**     | Error deleting resource                | -                |
| **500**     | Error deleting document                | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteEstablishmentOrderDoc

> EstablishmentOrderDocDto deleteEstablishmentOrderDoc(recResourceId, s3Key)

Delete an establishment order document

Deletes the document from S3 and removes the database record. The s3_key should
be URL-encoded.

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { DeleteEstablishmentOrderDocRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
    // string | S3 key (URL-encoded, e.g., REC0001%2Ffilename.pdf)
    s3Key: REC0001%2Festablishment-order.pdf,
  } satisfies DeleteEstablishmentOrderDocRequest;

  try {
    const data = await api.deleteEstablishmentOrderDoc(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description                                        | Notes                     |
| ----------------- | -------- | -------------------------------------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID                             | [Defaults to `undefined`] |
| **s3Key**         | `string` | S3 key (URL-encoded, e.g., REC0001%2Ffilename.pdf) | [Defaults to `undefined`] |

### Return type

[**EstablishmentOrderDocDto**](EstablishmentOrderDocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                       | Response headers |
| ----------- | ------------------------------------------------- | ---------------- |
| **200**     | Establishment order document deleted successfully | -                |
| **401**     | Unauthorized                                      | -                |
| **404**     | Document not found                                | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteExhibitADoc

> ExhibitADocDto deleteExhibitADoc(recResourceId, documentId)

Delete an Exhibit A document

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { DeleteExhibitADocRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
    // string | Document UUID
    documentId: a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  } satisfies DeleteExhibitADocRequest;

  try {
    const data = await api.deleteExhibitADoc(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |
| **documentId**    | `string` | Document UUID          | [Defaults to `undefined`] |

### Return type

[**ExhibitADocDto**](ExhibitADocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description        | Response headers |
| ----------- | ------------------ | ---------------- |
| **200**     | Document deleted   | -                |
| **404**     | Document not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteImageResource

> RecreationResourceImageDto deleteImageResource(recResourceId, imageId)

Delete an image Resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { DeleteImageResourceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
    // string | Image identifier (UUID)
    imageId: a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  } satisfies DeleteImageResourceRequest;

  try {
    const data = await api.deleteImageResource(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description             | Notes                     |
| ----------------- | -------- | ----------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier     | [Defaults to `undefined`] |
| **imageId**       | `string` | Image identifier (UUID) | [Defaults to `undefined`] |

### Return type

[**RecreationResourceImageDto**](RecreationResourceImageDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | Image Deleted                       | -                |
| **404**     | Recreation Resource image not found | -                |
| **420**     | Error deleting resource             | -                |
| **500**     | Error deleting image                | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteRecreationResourceFee

> RecreationFeeDto deleteRecreationResourceFee(recResourceId, feeId)

Soft-delete an existing fee for a recreation resource

Marks an existing fee as deleted so it no longer appears in active admin or
public responses

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { DeleteRecreationResourceFeeRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
    // number | Fee ID
    feeId: 123,
  } satisfies DeleteRecreationResourceFeeRequest;

  try {
    const data = await api.deleteRecreationResourceFee(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |
| **feeId**         | `number` | Fee ID                 | [Defaults to `undefined`] |

### Return type

[**RecreationFeeDto**](RecreationFeeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | Fee deleted successfully                   | -                |
| **404**     | Fee not found for this recreation resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteTrail

> deleteTrail(recResourceId, trailId)

Delete a trail

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { DeleteTrailRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC160773,
    // number | Trail ID
    trailId: 1,
  } satisfies DeleteTrailRequest;

  try {
    const data = await api.deleteTrail(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |
| **trailId**       | `number` | Trail ID               | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                       | Response headers |
| ----------- | --------------------------------- | ---------------- |
| **204**     | Trail deleted successfully        | -                |
| **404**     | Trail not found for this resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## downloadExportCsv

> Blob downloadExportCsv(dataset, district, resourceType)

Download a CSV export dataset

Returns the full CSV payload for the requested export dataset

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { DownloadExportCsvRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // 'file-details' | 'file-details-fta' | 'fee-list' | 'fee-list-fta' | 'agreement-list' | 'agreement-list-fta' | 'campsite-list' | 'campsite-list-fta' | 'objective-list-fta' | 'asset-list' | 'structure-list-fta' | 'access-list' | 'access-list-fta' | 'activities-list' | 'activities-list-fta' | 'site-inspection-fta' | 'closure-list-fta' | 'asset-repair-list' | Implemented dataset identifier
    dataset: dataset_example,
    // string | Optional district code filter (optional)
    district: RCKY,
    // string | Optional resource type code filter (optional)
    resourceType: FAC,
  } satisfies DownloadExportCsvRequest;

  try {
    const data = await api.downloadExportCsv(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name             | Type                                                                                                                                                                                                                                                                                                                                               | Description                        | Notes                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **dataset**      | `file-details`, `file-details-fta`, `fee-list`, `fee-list-fta`, `agreement-list`, `agreement-list-fta`, `campsite-list`, `campsite-list-fta`, `objective-list-fta`, `asset-list`, `structure-list-fta`, `access-list`, `access-list-fta`, `activities-list`, `activities-list-fta`, `site-inspection-fta`, `closure-list-fta`, `asset-repair-list` | Implemented dataset identifier     | [Defaults to `undefined`] [Enum: file-details, file-details-fta, fee-list, fee-list-fta, agreement-list, agreement-list-fta, campsite-list, campsite-list-fta, objective-list-fta, asset-list, structure-list-fta, access-list, access-list-fta, activities-list, activities-list-fta, site-inspection-fta, closure-list-fta, asset-repair-list] |
| **district**     | `string`                                                                                                                                                                                                                                                                                                                                           | Optional district code filter      | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                             |
| **resourceType** | `string`                                                                                                                                                                                                                                                                                                                                           | Optional resource type code filter | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                             |

### Return type

**Blob**

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/csv`

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | CSV export file                 | -                |
| **400**     | Bad Request - validation errors | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## finalizeDocUpload

> RecreationResourceDocDto finalizeDocUpload(recResourceId,
> finalizeDocUploadRequestDto)

Finalize document upload and create database record

Creates database record for uploaded document. Should be called after S3 upload
completes successfully. No S3 verification is performed.

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { FinalizeDocUploadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204117,
    // FinalizeDocUploadRequestDto
    finalizeDocUploadRequestDto: ...,
  } satisfies FinalizeDocUploadRequest;

  try {
    const data = await api.finalizeDocUpload(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                            | Type                                                          | Description         | Notes                     |
| ------------------------------- | ------------------------------------------------------------- | ------------------- | ------------------------- |
| **recResourceId**               | `string`                                                      | Resource identifier | [Defaults to `undefined`] |
| **finalizeDocUploadRequestDto** | [FinalizeDocUploadRequestDto](FinalizeDocUploadRequestDto.md) |                     |                           |

### Return type

[**RecreationResourceDocDto**](RecreationResourceDocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Document record created       | -                |
| **404**     | Recreation Resource not found | -                |
| **500**     | Error finalizing upload       | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## finalizeExhibitAUpload

> ExhibitADocDto finalizeExhibitAUpload(recResourceId,
> finalizeExhibitAUploadRequestDto)

Finalize Exhibit A document upload and create database record

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { FinalizeExhibitAUploadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
    // FinalizeExhibitAUploadRequestDto
    finalizeExhibitAUploadRequestDto: ...,
  } satisfies FinalizeExhibitAUploadRequest;

  try {
    const data = await api.finalizeExhibitAUpload(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                                 | Type                                                                    | Description            | Notes                     |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**                    | `string`                                                                | Recreation Resource ID | [Defaults to `undefined`] |
| **finalizeExhibitAUploadRequestDto** | [FinalizeExhibitAUploadRequestDto](FinalizeExhibitAUploadRequestDto.md) |                        |                           |

### Return type

[**ExhibitADocDto**](ExhibitADocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Document record created       | -                |
| **404**     | Recreation Resource not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## finalizeImageUpload

> RecreationResourceImageDto finalizeImageUpload(recResourceId, imageId,
> fileName, fileSizeOriginal, dateTaken, containsPii, photographerType,
> photographerName, consentForm)

Finalize image upload and create database record

Creates database record for uploaded image variants and optional consent form.
Should be called after all S3 uploads complete successfully.

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { FinalizeImageUploadRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
    // string | Image ID (returned from presign endpoint)
    imageId: imageId_example,
    // string | Original image file name
    fileName: fileName_example,
    // number | Size of the original image variant in bytes
    fileSizeOriginal: 8.14,
    // string | Date the photo was taken (ISO date string) (optional)
    dateTaken: dateTaken_example,
    // boolean | Whether the image contains personally identifiable information (optional)
    containsPii: true,
    // string | Type of photographer (database code) (optional)
    photographerType: photographerType_example,
    // string | Name of the photographer for attribution (optional)
    photographerName: photographerName_example,
    // Blob | Consent form PDF file (optional)
    consentForm: BINARY_DATA_HERE,
  } satisfies FinalizeImageUploadRequest;

  try {
    const data = await api.finalizeImageUpload(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                 | Type      | Description                                                    | Notes                                |
| -------------------- | --------- | -------------------------------------------------------------- | ------------------------------------ |
| **recResourceId**    | `string`  | Resource identifier                                            | [Defaults to `undefined`]            |
| **imageId**          | `string`  | Image ID (returned from presign endpoint)                      | [Defaults to `undefined`]            |
| **fileName**         | `string`  | Original image file name                                       | [Defaults to `undefined`]            |
| **fileSizeOriginal** | `number`  | Size of the original image variant in bytes                    | [Defaults to `undefined`]            |
| **dateTaken**        | `string`  | Date the photo was taken (ISO date string)                     | [Optional] [Defaults to `undefined`] |
| **containsPii**      | `boolean` | Whether the image contains personally identifiable information | [Optional] [Defaults to `undefined`] |
| **photographerType** | `string`  | Type of photographer (database code)                           | [Optional] [Defaults to `undefined`] |
| **photographerName** | `string`  | Name of the photographer for attribution                       | [Optional] [Defaults to `undefined`] |
| **consentForm**      | `Blob`    | Consent form PDF file                                          | [Optional] [Defaults to `undefined`] |

### Return type

[**RecreationResourceImageDto**](RecreationResourceImageDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Image record created          | -                |
| **404**     | Recreation Resource not found | -                |
| **500**     | Error finalizing upload       | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getActivitiesByRecResourceId

> Array&lt;RecreationActivityDto&gt; getActivitiesByRecResourceId(recResourceId)

Get all activities related to the resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetActivitiesByRecResourceIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
  } satisfies GetActivitiesByRecResourceIdRequest;

  try {
    const data = await api.getActivitiesByRecResourceId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description         | Notes                     |
| ----------------- | -------- | ------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationActivityDto&gt;**](RecreationActivityDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Activities Found              | -                |
| **400**     | Bad Request - invalid ID      | -                |
| **404**     | Recreation Resource not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getAllEstablishmentOrderDocs

> Array&lt;EstablishmentOrderDocDto&gt;
> getAllEstablishmentOrderDocs(recResourceId)

Get all establishment order documents for a recreation resource

Returns a list of establishment order documents with presigned URLs for download

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetAllEstablishmentOrderDocsRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
  } satisfies GetAllEstablishmentOrderDocsRequest;

  try {
    const data = await api.getAllEstablishmentOrderDocs(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;EstablishmentOrderDocDto&gt;**](EstablishmentOrderDocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                           | Response headers |
| ----------- | ------------------------------------- | ---------------- |
| **200**     | List of establishment order documents | -                |
| **401**     | Unauthorized                          | -                |
| **404**     | Recreation resource not found         | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getAllExhibitADocs

> Array&lt;ExhibitADocDto&gt; getAllExhibitADocs(recResourceId)

Get all Exhibit A documents for a recreation resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetAllExhibitADocsRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
  } satisfies GetAllExhibitADocsRequest;

  try {
    const data = await api.getAllExhibitADocs(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;ExhibitADocDto&gt;**](ExhibitADocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | List of Exhibit A documents   | -                |
| **404**     | Recreation resource not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getConsentFormDownloadUrl

> ConsentFormDownloadResponseDto getConsentFormDownloadUrl(recResourceId,
> imageId)

Get presigned URL for consent form download

Returns a time-limited presigned URL for downloading the consent form PDF
associated with an image.

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { GetConsentFormDownloadUrlRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
    // string | Image identifier (UUID)
    imageId: a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  } satisfies GetConsentFormDownloadUrlRequest;

  try {
    const data = await api.getConsentFormDownloadUrl(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description             | Notes                     |
| ----------------- | -------- | ----------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier     | [Defaults to `undefined`] |
| **imageId**       | `string` | Image identifier (UUID) | [Defaults to `undefined`] |

### Return type

[**ConsentFormDownloadResponseDto**](ConsentFormDownloadResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                      | Response headers |
| ----------- | -------------------------------- | ---------------- |
| **200**     | Presigned download URL generated | -                |
| **404**     | Image or consent form not found  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getDocumentsByRecResourceId

> Array&lt;RecreationResourceDocDto&gt;
> getDocumentsByRecResourceId(recResourceId)

Get all documents related to the resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetDocumentsByRecResourceIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204117,
  } satisfies GetDocumentsByRecResourceIdRequest;

  try {
    const data = await api.getDocumentsByRecResourceId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description         | Notes                     |
| ----------------- | -------- | ------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationResourceDocDto&gt;**](RecreationResourceDocDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description     | Response headers |
| ----------- | --------------- | ---------------- |
| **200**     | Documents Found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getExportDatasets

> ListExportDatasetsResponseDto getExportDatasets()

List CSV export datasets

Returns the datasets currently available for the admin CSV export workflow

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetExportDatasetsRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  try {
    const data = await api.getExportDatasets();
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

[**ListExportDatasetsResponseDto**](ListExportDatasetsResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Datasets available for export | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getExportPreview

> ExportPreviewResponseDto getExportPreview(dataset, district, resourceType,
> limit)

Preview a CSV export dataset

Returns a limited row preview for the requested export dataset

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetExportPreviewRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // 'file-details' | 'file-details-fta' | 'fee-list' | 'fee-list-fta' | 'agreement-list' | 'agreement-list-fta' | 'campsite-list' | 'campsite-list-fta' | 'objective-list-fta' | 'asset-list' | 'structure-list-fta' | 'access-list' | 'access-list-fta' | 'activities-list' | 'activities-list-fta' | 'site-inspection-fta' | 'closure-list-fta' | 'asset-repair-list' | Implemented dataset identifier
    dataset: dataset_example,
    // string | Optional district code filter (optional)
    district: RCKY,
    // string | Optional resource type code filter (optional)
    resourceType: FAC,
    // number | Preview row limit (optional)
    limit: 8.14,
  } satisfies GetExportPreviewRequest;

  try {
    const data = await api.getExportPreview(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name             | Type                                                                                                                                                                                                                                                                                                                                               | Description                        | Notes                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **dataset**      | `file-details`, `file-details-fta`, `fee-list`, `fee-list-fta`, `agreement-list`, `agreement-list-fta`, `campsite-list`, `campsite-list-fta`, `objective-list-fta`, `asset-list`, `structure-list-fta`, `access-list`, `access-list-fta`, `activities-list`, `activities-list-fta`, `site-inspection-fta`, `closure-list-fta`, `asset-repair-list` | Implemented dataset identifier     | [Defaults to `undefined`] [Enum: file-details, file-details-fta, fee-list, fee-list-fta, agreement-list, agreement-list-fta, campsite-list, campsite-list-fta, objective-list-fta, asset-list, structure-list-fta, access-list, access-list-fta, activities-list, activities-list-fta, site-inspection-fta, closure-list-fta, asset-repair-list] |
| **district**     | `string`                                                                                                                                                                                                                                                                                                                                           | Optional district code filter      | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                             |
| **resourceType** | `string`                                                                                                                                                                                                                                                                                                                                           | Optional resource type code filter | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                             |
| **limit**        | `number`                                                                                                                                                                                                                                                                                                                                           | Preview row limit                  | [Optional] [Defaults to `50`]                                                                                                                                                                                                                                                                                                                    |

### Return type

[**ExportPreviewResponseDto**](ExportPreviewResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Preview rows for the requested dataset | -                |
| **400**     | Bad Request - validation errors        | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getFeaturesByRecResourceId

> Array&lt;RecreationFeatureDto&gt; getFeaturesByRecResourceId(recResourceId)

Get all features related to the resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetFeaturesByRecResourceIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
  } satisfies GetFeaturesByRecResourceIdRequest;

  try {
    const data = await api.getFeaturesByRecResourceId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description         | Notes                     |
| ----------------- | -------- | ------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationFeatureDto&gt;**](RecreationFeatureDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Features Found                | -                |
| **400**     | Bad Request - invalid ID      | -                |
| **404**     | Recreation Resource not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getImagesByRecResourceId

> Array&lt;RecreationResourceImageDto&gt;
> getImagesByRecResourceId(recResourceId)

Get all images related to the resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetImagesByRecResourceIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
  } satisfies GetImagesByRecResourceIdRequest;

  try {
    const data = await api.getImagesByRecResourceId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description         | Notes                     |
| ----------------- | -------- | ------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationResourceImageDto&gt;**](RecreationResourceImageDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | Images Found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getOptionsByType

> Array&lt;OptionDto&gt; getOptionsByType(type)

List all options for a type

Retrieve all available values for a given option type. Valid types: activities,
accessibleActivities, access, sub-access, maintenance, resourceType, feeType,
featureCode, recreationStatus, structure, controlAccessCode, riskRatingCode,
district, photographerType, closestCommunity, recStatusCode

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetOptionsByTypeRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // 'activities' | 'accessibleActivities' | 'access' | 'sub-access' | 'maintenance' | 'resourceType' | 'feeType' | 'featureCode' | 'recreationStatus' | 'structure' | 'controlAccessCode' | 'riskRatingCode' | 'district' | 'photographerType' | 'closestCommunity' | 'recStatusCode' | Option type
    type: type_example,
  } satisfies GetOptionsByTypeRequest;

  try {
    const data = await api.getOptionsByType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type                                                                                                                                                                                                                                                               | Description | Notes                                                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **type** | `activities`, `accessibleActivities`, `access`, `sub-access`, `maintenance`, `resourceType`, `feeType`, `featureCode`, `recreationStatus`, `structure`, `controlAccessCode`, `riskRatingCode`, `district`, `photographerType`, `closestCommunity`, `recStatusCode` | Option type | [Defaults to `undefined`] [Enum: activities, accessibleActivities, access, sub-access, maintenance, resourceType, feeType, featureCode, recreationStatus, structure, controlAccessCode, riskRatingCode, district, photographerType, closestCommunity, recStatusCode] |

### Return type

[**Array&lt;OptionDto&gt;**](OptionDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description     | Response headers |
| ----------- | --------------- | ---------------- |
| **200**     | List of options | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getOptionsByTypes

> Array&lt;OptionsByTypeDto&gt; getOptionsByTypes(types)

List options for multiple types

Retrieve options for multiple option types. Provide a comma-separated list of
types in the &#x60;types&#x60; query parameter. The order of elements in the
response matches the order of types provided by the client.

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetOptionsByTypesRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // Array<'activities' | 'accessibleActivities' | 'access' | 'sub-access' | 'maintenance' | 'resourceType' | 'feeType' | 'featureCode' | 'recreationStatus' | 'structure' | 'controlAccessCode' | 'riskRatingCode' | 'district' | 'photographerType' | 'closestCommunity' | 'recStatusCode'> | Comma-separated list of option types. The response preserves the order of types in this list and returns one entry per requested type.
    types: activities,
    accessibleActivities,
    access,
  } satisfies GetOptionsByTypesRequest;

  try {
    const data = await api.getOptionsByTypes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name      | Type                                                                                                                                                                                                                                                               | Description                                                                                                                            | Notes                                                                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **types** | `activities`, `accessibleActivities`, `access`, `sub-access`, `maintenance`, `resourceType`, `feeType`, `featureCode`, `recreationStatus`, `structure`, `controlAccessCode`, `riskRatingCode`, `district`, `photographerType`, `closestCommunity`, `recStatusCode` | Comma-separated list of option types. The response preserves the order of types in this list and returns one entry per requested type. | [Enum: activities, accessibleActivities, access, sub-access, maintenance, resourceType, feeType, featureCode, recreationStatus, structure, controlAccessCode, riskRatingCode, district, photographerType, closestCommunity, recStatusCode] |

### Return type

[**Array&lt;OptionsByTypeDto&gt;**](OptionsByTypeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                                                                              | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **200**     | List of options grouped by type. Each array element corresponds to a requested type in the same order as the input list. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationResourceAdvisories

> Array&lt;RecreationResourceAdvisoryDto&gt;
> getRecreationResourceAdvisories(recResourceId)

Get advisories and closures for a recreation resource

Returns a priority-sorted list of advisories and closures for a recreation
resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetRecreationResourceAdvisoriesRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
  } satisfies GetRecreationResourceAdvisoriesRequest;

  try {
    const data = await api.getRecreationResourceAdvisories(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationResourceAdvisoryDto&gt;**](RecreationResourceAdvisoryDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Advisories for the recreation resource | -                |
| **401**     | Unauthorized                           | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationResourceById

> RecreationResourceDetailDto getRecreationResourceById(recResourceId)

Find recreation resource by ID

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetRecreationResourceByIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
  } satisfies GetRecreationResourceByIdRequest;

  try {
    const data = await api.getRecreationResourceById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description         | Notes                     |
| ----------------- | -------- | ------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier | [Defaults to `undefined`] |

### Return type

[**RecreationResourceDetailDto**](RecreationResourceDetailDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Resource found           | -                |
| **400**     | Bad Request - invalid ID | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationResourceFees

> Array&lt;RecreationFeeDto&gt; getRecreationResourceFees(recResourceId)

Get all fees for a recreation resource

Returns a list of fees for the recreation resource, sorted by fee type and start
date

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetRecreationResourceFeesRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
  } satisfies GetRecreationResourceFeesRequest;

  try {
    const data = await api.getRecreationResourceFees(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationFeeDto&gt;**](RecreationFeeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                              | Response headers |
| ----------- | ---------------------------------------- | ---------------- |
| **200**     | List of fees for the recreation resource | -                |
| **401**     | Unauthorized                             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationResourceGeospatial

> RecreationResourceGeospatialDto getRecreationResourceGeospatial(recResourceId)

Get geospatial data for a recreation resource

Returns geospatial data including spatial feature geometries and calculated
coordinate values

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetRecreationResourceGeospatialRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
  } satisfies GetRecreationResourceGeospatialRequest;

  try {
    const data = await api.getRecreationResourceGeospatial(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**RecreationResourceGeospatialDto**](RecreationResourceGeospatialDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                 | Response headers |
| ----------- | ------------------------------------------- | ---------------- |
| **200**     | Geospatial data for the recreation resource | -                |
| **401**     | Unauthorized                                | -                |
| **404**     | Geospatial data not found                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationResourceReservation

> RecreationResourceReservationInfoDto
> getRecreationResourceReservation(recResourceId)

Get reservation data for a recreation resource

Returns reservation data for a recreation resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetRecreationResourceReservationRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
  } satisfies GetRecreationResourceReservationRequest;

  try {
    const data = await api.getRecreationResourceReservation(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**RecreationResourceReservationInfoDto**](RecreationResourceReservationInfoDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                  | Response headers |
| ----------- | -------------------------------------------- | ---------------- |
| **200**     | Reservation data for the recreation resource | -                |
| **401**     | Unauthorized                                 | -                |
| **404**     | Reservation data not found                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getRecreationResourceSuggestions

> SuggestionsResponseDto getRecreationResourceSuggestions(searchTerm)

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { GetRecreationResourceSuggestionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Search term used to search by name or ID.
    searchTerm: Tamihi All,
  } satisfies GetRecreationResourceSuggestionsRequest;

  try {
    const data = await api.getRecreationResourceSuggestions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name           | Type     | Description                               | Notes                     |
| -------------- | -------- | ----------------------------------------- | ------------------------- |
| **searchTerm** | `string` | Search term used to search by name or ID. | [Defaults to `undefined`] |

### Return type

[**SuggestionsResponseDto**](SuggestionsResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | Successful retrieval of suggestions | -                |
| **400**     | Bad Request - validation errors     | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getTrailsByRecResourceId

> Array&lt;RecreationTrailDto&gt; getTrailsByRecResourceId(recResourceId)

Get all trails for a recreation resource

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { GetTrailsByRecResourceIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC160773,
  } satisfies GetTrailsByRecResourceIdRequest;

  try {
    const data = await api.getTrailsByRecResourceId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description            | Notes                     |
| ----------------- | -------- | ---------------------- | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID | [Defaults to `undefined`] |

### Return type

[**Array&lt;RecreationTrailDto&gt;**](RecreationTrailDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | List of trails for the recreation resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## presignDocUpload

> PresignDocUploadResponseDto presignDocUpload(recResourceId, fileName)

Request presigned URL for direct S3 document upload

Allocates a document ID and returns a presigned PUT URL for uploading the PDF
directly to S3.

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { PresignDocUploadRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204117,
    // string | Document file name with extension (e.g., map.pdf)
    fileName: campbell - river - site - map.pdf,
  } satisfies PresignDocUploadRequest;

  try {
    const data = await api.presignDocUpload(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description                                       | Notes                     |
| ----------------- | -------- | ------------------------------------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier                               | [Defaults to `undefined`] |
| **fileName**      | `string` | Document file name with extension (e.g., map.pdf) | [Defaults to `undefined`] |

### Return type

[**PresignDocUploadResponseDto**](PresignDocUploadResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                    | Response headers |
| ----------- | ------------------------------ | ---------------- |
| **200**     | Presigned URL generated        | -                |
| **404**     | Recreation Resource not found  | -                |
| **500**     | Error generating presigned URL | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## presignExhibitAUpload

> PresignExhibitAUploadResponseDto presignExhibitAUpload(recResourceId,
> fileName)

Request presigned URL for direct S3 Exhibit A document upload

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { PresignExhibitAUploadRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC0001,
    // string | File name with extension
    fileName: exhibit - a.pdf,
  } satisfies PresignExhibitAUploadRequest;

  try {
    const data = await api.presignExhibitAUpload(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description              | Notes                     |
| ----------------- | -------- | ------------------------ | ------------------------- |
| **recResourceId** | `string` | Recreation Resource ID   | [Defaults to `undefined`] |
| **fileName**      | `string` | File name with extension | [Defaults to `undefined`] |

### Return type

[**PresignExhibitAUploadResponseDto**](PresignExhibitAUploadResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Presigned URL generated       | -                |
| **404**     | Recreation Resource not found | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## presignImageUpload

> PresignImageUploadResponseDto presignImageUpload(recResourceId, fileName)

Request presigned URLs for direct S3 image variant upload

Allocates an image ID and returns 4 presigned PUT URLs for uploading WebP
variants directly to S3. Variants should be generated client-side.

### Example

```ts
import { Configuration, RecreationResourcesApi } from '';
import type { PresignImageUploadRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
    // string | User-edited filename (without extension) to tag on original.webp
    fileName: my - image,
  } satisfies PresignImageUploadRequest;

  try {
    const data = await api.presignImageUpload(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description                                                      | Notes                     |
| ----------------- | -------- | ---------------------------------------------------------------- | ------------------------- |
| **recResourceId** | `string` | Resource identifier                                              | [Defaults to `undefined`] |
| **fileName**      | `string` | User-edited filename (without extension) to tag on original.webp | [Defaults to `undefined`] |

### Return type

[**PresignImageUploadResponseDto**](PresignImageUploadResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | Presigned URLs generated        | -                |
| **404**     | Recreation Resource not found   | -                |
| **500**     | Error generating presigned URLs | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## searchRecreationResources

> AdminSearchResponseDto searchRecreationResources(q, sort, page, pageSize,
> type, district, activities, access, closestCommunity, status,
> establishmentDateFrom, establishmentDateTo, established, publicAccessStatus,
> recStatus)

Search recreation resources for admin

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { SearchRecreationResourcesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Free-text search query (optional)
    q: tamihi,
    // 'name:asc' | 'name:desc' | 'rec_resource_id:asc' | 'rec_resource_id:desc' | 'type:asc' | 'type:desc' | 'established_date:asc' | 'established_date:desc' | 'activities:asc' | 'activities:desc' | 'access:asc' | 'access:desc' | 'fee:asc' | 'fee:desc' | 'community:asc' | 'community:desc' | 'status:asc' | 'status:desc' | 'campsites:asc' | 'campsites:desc' | 'district:asc' | 'district:desc' | 'display_on_public_site:asc' | 'display_on_public_site:desc' | 'file_status:asc' | 'file_status:desc' | 'public_access_status:asc' | 'public_access_status:desc' | 'updated_at:asc' | 'updated_at:desc' | Sort field and direction (optional)
    sort: name:asc,
    // number | 1-based page number (optional)
    page: 1,
    // 25 | 50 | 100 | Page size (optional)
    pageSize: 25,
    // Array<string> | Recreation resource type codes (optional)
    type: ["SIT","RTR"],
    // Array<string> | Recreation district codes (optional)
    district: ["CHWK","RDCK"],
    // Array<string> | Recreation activity codes (optional)
    activities: ["1","22"],
    // Array<string> | Access codes (optional)
    access: ["R","B"],
    // Array<string> | Closest communities (optional)
    closestCommunity: ["Chilliwack","Whistler"],
    // Array<string> | Recreation status codes (optional)
    status: ["1","2"],
    // string | Project established date range start (optional)
    establishmentDateFrom: 2020-01-01,
    // string | Project established date range end (optional)
    establishmentDateTo: 2025-12-31,
    // 'yes' | 'no' | Filter by establishment date presence (yes/no) (optional)
    established: yes,
    // Array<string> | Public access status group labels (optional)
    publicAccessStatus: ["Open","Closed"],
    // Array<string> | Resource file status codes (rec_status_code) (optional)
    recStatus: ["HI","PE"],
  } satisfies SearchRecreationResourcesRequest;

  try {
    const data = await api.searchRecreationResources(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Description                                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **q**                     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Free-text search query                         | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **sort**                  | `name:asc`, `name:desc`, `rec_resource_id:asc`, `rec_resource_id:desc`, `type:asc`, `type:desc`, `established_date:asc`, `established_date:desc`, `activities:asc`, `activities:desc`, `access:asc`, `access:desc`, `fee:asc`, `fee:desc`, `community:asc`, `community:desc`, `status:asc`, `status:desc`, `campsites:asc`, `campsites:desc`, `district:asc`, `district:desc`, `display_on_public_site:asc`, `display_on_public_site:desc`, `file_status:asc`, `file_status:desc`, `public_access_status:asc`, `public_access_status:desc`, `updated_at:asc`, `updated_at:desc` | Sort field and direction                       | [Optional] [Defaults to `undefined`] [Enum: name:asc, name:desc, rec_resource_id:asc, rec_resource_id:desc, type:asc, type:desc, established_date:asc, established_date:desc, activities:asc, activities:desc, access:asc, access:desc, fee:asc, fee:desc, community:asc, community:desc, status:asc, status:desc, campsites:asc, campsites:desc, district:asc, district:desc, display_on_public_site:asc, display_on_public_site:desc, file_status:asc, file_status:desc, public_access_status:asc, public_access_status:desc, updated_at:asc, updated_at:desc] |
| **page**                  | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 1-based page number                            | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **pageSize**              | `25`, `50`, `100`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Page size                                      | [Optional] [Defaults to `undefined`] [Enum: 25, 50, 100]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **type**                  | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Recreation resource type codes                 | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **district**              | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Recreation district codes                      | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **activities**            | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Recreation activity codes                      | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **access**                | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Access codes                                   | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **closestCommunity**      | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Closest communities                            | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **status**                | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Recreation status codes                        | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **establishmentDateFrom** | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Project established date range start           | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **establishmentDateTo**   | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Project established date range end             | [Optional] [Defaults to `undefined`]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **established**           | `yes`, `no`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Filter by establishment date presence (yes/no) | [Optional] [Defaults to `undefined`] [Enum: yes, no]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **publicAccessStatus**    | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Public access status group labels              | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **recStatus**             | `Array<string>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Resource file status codes (rec_status_code)   | [Optional]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Return type

[**AdminSearchResponseDto**](AdminSearchResponseDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                  | Response headers |
| ----------- | -------------------------------------------- | ---------------- |
| **200**     | Successful retrieval of admin search results | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateActivities

> Array&lt;RecreationActivityDto&gt; updateActivities(recResourceId,
> updateActivitiesDto)

Update activities for a recreation resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateActivitiesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
    // UpdateActivitiesDto | Activity codes to associate with the resource
    updateActivitiesDto: ...,
  } satisfies UpdateActivitiesRequest;

  try {
    const data = await api.updateActivities(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                    | Type                                          | Description                                   | Notes                     |
| ----------------------- | --------------------------------------------- | --------------------------------------------- | ------------------------- |
| **recResourceId**       | `string`                                      | Resource identifier                           | [Defaults to `undefined`] |
| **updateActivitiesDto** | [UpdateActivitiesDto](UpdateActivitiesDto.md) | Activity codes to associate with the resource |                           |

### Return type

[**Array&lt;RecreationActivityDto&gt;**](RecreationActivityDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | Activities Updated              | -                |
| **400**     | Bad Request - validation errors | -                |
| **404**     | Recreation Resource not found   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateFeatures

> Array&lt;RecreationFeatureDto&gt; updateFeatures(recResourceId,
> updateFeaturesDto)

Update features for a recreation resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateFeaturesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
    // UpdateFeaturesDto | Feature codes to associate with the resource
    updateFeaturesDto: ...,
  } satisfies UpdateFeaturesRequest;

  try {
    const data = await api.updateFeatures(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                  | Type                                      | Description                                  | Notes                     |
| --------------------- | ----------------------------------------- | -------------------------------------------- | ------------------------- |
| **recResourceId**     | `string`                                  | Resource identifier                          | [Defaults to `undefined`] |
| **updateFeaturesDto** | [UpdateFeaturesDto](UpdateFeaturesDto.md) | Feature codes to associate with the resource |                           |

### Return type

[**Array&lt;RecreationFeatureDto&gt;**](RecreationFeatureDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | Features Updated                | -                |
| **400**     | Bad Request - validation errors | -                |
| **404**     | Recreation Resource not found   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateImageConsent

> RecreationResourceImageDto updateImageConsent(recResourceId, imageId,
> updateImageConsentPatchDto)

Update consent metadata for an existing image

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateImageConsentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC204118,
    // string | Image identifier (UUID)
    imageId: a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
    // UpdateImageConsentPatchDto | Consent metadata updates (name/date only)
    updateImageConsentPatchDto: ...,
  } satisfies UpdateImageConsentRequest;

  try {
    const data = await api.updateImageConsent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                           | Type                                                        | Description                               | Notes                     |
| ------------------------------ | ----------------------------------------------------------- | ----------------------------------------- | ------------------------- |
| **recResourceId**              | `string`                                                    | Resource identifier                       | [Defaults to `undefined`] |
| **imageId**                    | `string`                                                    | Image identifier (UUID)                   | [Defaults to `undefined`] |
| **updateImageConsentPatchDto** | [UpdateImageConsentPatchDto](UpdateImageConsentPatchDto.md) | Consent metadata updates (name/date only) |                           |

### Return type

[**RecreationResourceImageDto**](RecreationResourceImageDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Consent metadata updated | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateRecreationResourceById

> RecreationResourceDetailDto updateRecreationResourceById(recResourceId,
> updateRecreationResourceDto)

Update recreation resource by ID

Updates a recreation resource. Automatically handles both direct fields and
related table fields (description, driving_directions) based on the request
content.

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateRecreationResourceByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
    // UpdateRecreationResourceDto | Recreation resource update data. Must include at least one field to update.
    updateRecreationResourceDto: ...,
  } satisfies UpdateRecreationResourceByIdRequest;

  try {
    const data = await api.updateRecreationResourceById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                            | Type                                                          | Description                                                                 | Notes                     |
| ------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------- |
| **recResourceId**               | `string`                                                      | Resource identifier                                                         | [Defaults to `undefined`] |
| **updateRecreationResourceDto** | [UpdateRecreationResourceDto](UpdateRecreationResourceDto.md) | Recreation resource update data. Must include at least one field to update. |                           |

### Return type

[**RecreationResourceDetailDto**](RecreationResourceDetailDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                   | Response headers |
| ----------- | --------------------------------------------- | ---------------- |
| **200**     | Resource updated successfully                 | -                |
| **400**     | Bad Request - validation errors or invalid ID | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateRecreationResourceFee

> RecreationFeeDto updateRecreationResourceFee(recResourceId, feeId,
> updateRecreationFeeDto)

Update an existing fee for a recreation resource

Updates an existing fee identified by fee_id and associated with the recreation
resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateRecreationResourceFeeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
    // number | Fee ID
    feeId: 123,
    // UpdateRecreationFeeDto | Fee fields to update
    updateRecreationFeeDto: ...,
  } satisfies UpdateRecreationResourceFeeRequest;

  try {
    const data = await api.updateRecreationResourceFee(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                       | Type                                                | Description            | Notes                     |
| -------------------------- | --------------------------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**          | `string`                                            | Recreation Resource ID | [Defaults to `undefined`] |
| **feeId**                  | `number`                                            | Fee ID                 | [Defaults to `undefined`] |
| **updateRecreationFeeDto** | [UpdateRecreationFeeDto](UpdateRecreationFeeDto.md) | Fee fields to update   |                           |

### Return type

[**RecreationFeeDto**](RecreationFeeDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                            | Response headers |
| ----------- | ------------------------------------------------------ | ---------------- |
| **200**     | Fee updated successfully                               | -                |
| **400**     | Bad Request - validation errors                        | -                |
| **404**     | Fee not found for this recreation resource             | -                |
| **409**     | Fee type and sub-type already exists for this resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateRecreationResourceGeospatial

> RecreationResourceGeospatialDto
> updateRecreationResourceGeospatial(recResourceId,
> updateRecreationResourceGeospatialDto)

Update geospatial data for a recreation resource

Updates or inserts the site point geometry based on provided UTM fields (zone,
easting, northing)

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateRecreationResourceGeospatialRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
    // UpdateRecreationResourceGeospatialDto
    updateRecreationResourceGeospatialDto: ...,
  } satisfies UpdateRecreationResourceGeospatialRequest;

  try {
    const data = await api.updateRecreationResourceGeospatial(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                                      | Type                                                                              | Description            | Notes                     |
| ----------------------------------------- | --------------------------------------------------------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**                         | `string`                                                                          | Recreation Resource ID | [Defaults to `undefined`] |
| **updateRecreationResourceGeospatialDto** | [UpdateRecreationResourceGeospatialDto](UpdateRecreationResourceGeospatialDto.md) |                        |                           |

### Return type

[**RecreationResourceGeospatialDto**](RecreationResourceGeospatialDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                         | Response headers |
| ----------- | --------------------------------------------------- | ---------------- |
| **200**     | Updated geospatial data for the recreation resource | -                |
| **400**     | Bad Request - validation errors or invalid input    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateRecreationResourceReservation

> UpdateRecreationResourceReservationDto
> updateRecreationResourceReservation(recResourceId,
> updateRecreationResourceReservationDto)

Update reservation data for a recreation resource

Updates or inserts reservation data for a recreation resource

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateRecreationResourceReservationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC262200,
    // UpdateRecreationResourceReservationDto
    updateRecreationResourceReservationDto: ...,
  } satisfies UpdateRecreationResourceReservationRequest;

  try {
    const data = await api.updateRecreationResourceReservation(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                                       | Type                                                                                | Description            | Notes                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**                          | `string`                                                                            | Recreation Resource ID | [Defaults to `undefined`] |
| **updateRecreationResourceReservationDto** | [UpdateRecreationResourceReservationDto](UpdateRecreationResourceReservationDto.md) |                        |                           |

### Return type

[**UpdateRecreationResourceReservationDto**](UpdateRecreationResourceReservationDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                          | Response headers |
| ----------- | ---------------------------------------------------- | ---------------- |
| **200**     | Updated reservation data for the recreation resource | -                |
| **400**     | Bad Request - validation errors or invalid input     | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateTrail

> RecreationTrailDto updateTrail(recResourceId, trailId, updateTrailDto)

Update an existing trail

### Example

```ts
import {
  Configuration,
  RecreationResourcesApi,
} from '';
import type { UpdateTrailRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RecreationResourcesApi(config);

  const body = {
    // string | Recreation Resource ID
    recResourceId: REC160773,
    // number | Trail ID
    trailId: 1,
    // UpdateTrailDto
    updateTrailDto: ...,
  } satisfies UpdateTrailRequest;

  try {
    const data = await api.updateTrail(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name               | Type                                | Description            | Notes                     |
| ------------------ | ----------------------------------- | ---------------------- | ------------------------- |
| **recResourceId**  | `string`                            | Recreation Resource ID | [Defaults to `undefined`] |
| **trailId**        | `number`                            | Trail ID               | [Defaults to `undefined`] |
| **updateTrailDto** | [UpdateTrailDto](UpdateTrailDto.md) |                        |                           |

### Return type

[**RecreationTrailDto**](RecreationTrailDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                       | Response headers |
| ----------- | --------------------------------- | ---------------- |
| **200**     | Trail updated successfully        | -                |
| **400**     | Invalid trail data                | -                |
| **404**     | Trail not found for this resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
