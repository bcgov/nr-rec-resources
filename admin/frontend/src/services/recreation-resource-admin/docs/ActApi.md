# ActApi

All URIs are relative to _http://localhost_

| Method                                                       | HTTP request                                                          | Description                                                |
| ------------------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| [**bulkUpsertActAdvisory**](ActApi.md#bulkupsertactadvisory) | **POST** /api/v1/act/advisories/bulk                                  | Create or update the same advisory for multiple resources. |
| [**deleteActAdvisory**](ActApi.md#deleteactadvisory)         | **DELETE** /api/v1/act/advisories/{rec_resource_id}/{advisory_number} | Delete an advisory pushed from Act.                        |
| [**updateActAdvisory**](ActApi.md#updateactadvisory)         | **PUT** /api/v1/act/advisories/{rec_resource_id}/{advisory_number}    | Update an existing advisory pushed from Act.               |
| [**upsertActAdvisory**](ActApi.md#upsertactadvisory)         | **POST** /api/v1/act/advisories                                       | Create or update an advisory pushed from Act (upsert).     |

## bulkUpsertActAdvisory

> ActAdvisoryBulkResponseDto bulkUpsertActAdvisory(actAdvisoryBulkUpsertDto)

Create or update the same advisory for multiple resources.

Create or update the same advisory across multiple recreation resources in
&#x60;rst.act_advisories_flat&#x60;. The request carries one advisory payload
plus a &#x60;rec_resource_ids&#x60; array, and the backend creates or updates
one row per &#x60;(rec_resource_id, advisory_number)&#x60;. Single-resource PUT
and DELETE endpoints remain intentionally scoped to one natural key at a time.

### Example

```ts
import { Configuration, ActApi } from '';
import type { BulkUpsertActAdvisoryRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: act-keycloak application
    accessToken: 'YOUR ACCESS TOKEN',
  });
  const api = new ActApi(config);

  const body = {
    // ActAdvisoryBulkUpsertDto | Bulk advisory payload pushed by Act. The same advisory content is upserted for each supplied rec_resource_id.
    actAdvisoryBulkUpsertDto: {
      advisory_number: 3791,
      title: 'Bear in area',
      submitted_by: 'jdoe',
      access_status_name: 'Open with restrictions',
      access_status_grouplabel: 'Open',
      event_type: 'Wildlife',
      urgency: 'High',
      advisory_status: 'Published',
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: false,
      advisory_date: '2026-06-01T15:00:00.000Z',
      effective_date: null,
      updated_date: null,
      modified_date: '2026-06-05T08:30:00.000Z',
      listing_rank: 0,
      urgency_sequence: 0,
      access_status_precedence: 0,
      event_type_precedence: 0,
      description: null,
      access_status_description: null,
      is_reservations_affected: null,
      is_updated_date_displayed: null,
      end_date: null,
      expiry_date: null,
      removal_date: null,
      published_date: null,
      rec_resource_ids: ['REC0002', 'REC0042'],
    },
  } satisfies BulkUpsertActAdvisoryRequest;

  try {
    const data = await api.bulkUpsertActAdvisory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description                                                                                                   | Notes |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----- |
| **actAdvisoryBulkUpsertDto** | [ActAdvisoryBulkUpsertDto](ActAdvisoryBulkUpsertDto.md) | Bulk advisory payload pushed by Act. The same advisory content is upserted for each supplied rec_resource_id. |       |

### Return type

[**ActAdvisoryBulkResponseDto**](ActAdvisoryBulkResponseDto.md)

### Authorization

[act-keycloak application](../README.md#act-keycloak-application)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                                                                                                                   | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **201**     | Bulk advisory upsert completed.                                                                                                                               | -                |
| **400**     | Validation error in the payload.                                                                                                                              | -                |
| **401**     | Unauthorized - missing, malformed, or expired bearer token. Act must obtain a new token from the CSS token endpoint using the OAuth2 Client Credentials flow. | -                |
| **404**     | One or more recreation resources referenced by rec_resource_ids were not found.                                                                               | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteActAdvisory

> ActAdvisoryResponseDto deleteActAdvisory(recResourceId, advisoryNumber)

Delete an advisory pushed from Act.

Removes the advisory row in &#x60;rst.act_advisories_flat&#x60; for the given
natural key. This is invoked by Act when the advisory is deleted on their side.

### Example

```ts
import { Configuration, ActApi } from '';
import type { DeleteActAdvisoryRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: act-keycloak application
    accessToken: 'YOUR ACCESS TOKEN',
  });
  const api = new ActApi(config);

  const body = {
    // string | Recreation resource ID the advisory applies to.
    recResourceId: REC0002,
    // number | Act advisory number.
    advisoryNumber: 3791,
  } satisfies DeleteActAdvisoryRequest;

  try {
    const data = await api.deleteActAdvisory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name               | Type     | Description                                     | Notes                     |
| ------------------ | -------- | ----------------------------------------------- | ------------------------- |
| **recResourceId**  | `string` | Recreation resource ID the advisory applies to. | [Defaults to `undefined`] |
| **advisoryNumber** | `number` | Act advisory number.                            | [Defaults to `undefined`] |

### Return type

[**ActAdvisoryResponseDto**](ActAdvisoryResponseDto.md)

### Authorization

[act-keycloak application](../README.md#act-keycloak-application)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                                                                                                                   | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Advisory successfully deleted.                                                                                                                                | -                |
| **400**     | Invalid path parameters.                                                                                                                                      | -                |
| **401**     | Unauthorized - missing, malformed, or expired bearer token. Act must obtain a new token from the CSS token endpoint using the OAuth2 Client Credentials flow. | -                |
| **404**     | No advisory exists for the given natural key.                                                                                                                 | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateActAdvisory

> ActAdvisoryResponseDto updateActAdvisory(recResourceId, advisoryNumber,
> actAdvisoryUpdateDto)

Update an existing advisory pushed from Act.

Partial update of an existing advisory in &#x60;rst.act_advisories_flat&#x60;.
The composite natural key is supplied via URL path parameters.

### Example

```ts
import { Configuration, ActApi } from '';
import type { UpdateActAdvisoryRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: act-keycloak application
    accessToken: 'YOUR ACCESS TOKEN',
  });
  const api = new ActApi(config);

  const body = {
    // string | Recreation resource ID the advisory applies to.
    recResourceId: REC0002,
    // number | Act advisory number.
    advisoryNumber: 3791,
    // ActAdvisoryUpdateDto | Partial advisory payload. Only provided fields are updated.
    actAdvisoryUpdateDto: {
      title: 'Bear activity expanded near lake trail',
      description:
        'Bear activity has expanded to the lake trail area. Visitors should avoid the shoreline trail until further notice.',
      submitted_by: 'jdoe',
      access_status_name: 'Closed',
      access_status_grouplabel: 'Closed',
      access_status_description:
        'The shoreline trail is temporarily closed for public safety.',
      event_type: 'Wildlife',
      urgency: 'High',
      advisory_status: 'Published',
      is_reservations_affected: false,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: true,
      is_updated_date_displayed: true,
      advisory_date: '2026-06-01T15:00:00.000Z',
      effective_date: '2026-06-02T00:00:00.000Z',
      end_date: '2026-09-30T23:59:59.000Z',
      expiry_date: '2026-10-31T23:59:59.000Z',
      removal_date: '2026-11-15T00:00:00.000Z',
      updated_date: '2026-06-05T08:30:00.000Z',
      modified_date: '2026-06-05T08:30:00.000Z',
      published_date: '2026-06-02T00:00:00.000Z',
      listing_rank: 0,
      urgency_sequence: 0,
      access_status_precedence: 0,
      event_type_precedence: 0,
    },
  } satisfies UpdateActAdvisoryRequest;

  try {
    const data = await api.updateActAdvisory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                     | Type                                            | Description                                                 | Notes                     |
| ------------------------ | ----------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| **recResourceId**        | `string`                                        | Recreation resource ID the advisory applies to.             | [Defaults to `undefined`] |
| **advisoryNumber**       | `number`                                        | Act advisory number.                                        | [Defaults to `undefined`] |
| **actAdvisoryUpdateDto** | [ActAdvisoryUpdateDto](ActAdvisoryUpdateDto.md) | Partial advisory payload. Only provided fields are updated. |                           |

### Return type

[**ActAdvisoryResponseDto**](ActAdvisoryResponseDto.md)

### Authorization

[act-keycloak application](../README.md#act-keycloak-application)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                                                                                                                   | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Advisory successfully updated.                                                                                                                                | -                |
| **400**     | Validation error in the payload or path parameters.                                                                                                           | -                |
| **401**     | Unauthorized - missing, malformed, or expired bearer token. Act must obtain a new token from the CSS token endpoint using the OAuth2 Client Credentials flow. | -                |
| **404**     | No advisory exists for the given natural key.                                                                                                                 | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## upsertActAdvisory

> ActAdvisoryResponseDto upsertActAdvisory(actAdvisoryUpsertDto)

Create or update an advisory pushed from Act (upsert).

Idempotent upsert of an advisory in &#x60;rst.act_advisories_flat&#x60;. The
composite natural key (rec_resource_id, advisory_number) determines whether a
record is created or updated.

### Example

```ts
import { Configuration, ActApi } from '';
import type { UpsertActAdvisoryRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: act-keycloak application
    accessToken: 'YOUR ACCESS TOKEN',
  });
  const api = new ActApi(config);

  const body = {
    // ActAdvisoryUpsertDto | Full advisory payload pushed by Act.
    actAdvisoryUpsertDto: {
      advisory_number: 3791,
      title: 'Bear in area',
      submitted_by: 'jdoe',
      access_status_name: 'Open with restrictions',
      access_status_grouplabel: 'Open',
      event_type: 'Wildlife',
      urgency: 'High',
      advisory_status: 'Published',
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: false,
      advisory_date: '2026-06-01T15:00:00.000Z',
      effective_date: '2026-06-02T00:00:00.000Z',
      updated_date: '2026-06-05T08:30:00.000Z',
      modified_date: '2026-06-05T08:30:00.000Z',
      listing_rank: 0,
      urgency_sequence: 0,
      access_status_precedence: 0,
      event_type_precedence: 0,
      rec_resource_id: 'REC0002',
      description:
        'A black bear has been spotted near the main campground. Please use bear-safe storage.',
      access_status_description: 'The site is open but some trails are closed.',
      is_reservations_affected: false,
      is_updated_date_displayed: true,
      end_date: '2026-09-30T23:59:59.000Z',
      expiry_date: '2026-10-31T23:59:59.000Z',
      removal_date: '2026-11-15T00:00:00.000Z',
      published_date: '2026-06-02T00:00:00.000Z',
    },
  } satisfies UpsertActAdvisoryRequest;

  try {
    const data = await api.upsertActAdvisory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                     | Type                                            | Description                          | Notes |
| ------------------------ | ----------------------------------------------- | ------------------------------------ | ----- |
| **actAdvisoryUpsertDto** | [ActAdvisoryUpsertDto](ActAdvisoryUpsertDto.md) | Full advisory payload pushed by Act. |       |

### Return type

[**ActAdvisoryResponseDto**](ActAdvisoryResponseDto.md)

### Authorization

[act-keycloak application](../README.md#act-keycloak-application)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                                                                                                                   | Response headers |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **201**     | Advisory successfully created or updated.                                                                                                                     | -                |
| **400**     | Validation error in the payload.                                                                                                                              | -                |
| **401**     | Unauthorized - missing, malformed, or expired bearer token. Act must obtain a new token from the CSS token endpoint using the OAuth2 Client Credentials flow. | -                |
| **404**     | Recreation resource referenced by rec_resource_id not found.                                                                                                  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
