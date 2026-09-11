# PartnersApi

All URIs are relative to _http://localhost_

| Method                                                                                                | HTTP request                                                  | Description                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| [**createRecreationResourceAgreementHolder**](PartnersApi.md#createrecreationresourceagreementholder) | **POST** /api/partners/recreation-resources/{rec_resource_id} | Add agreement holder for a recreation resource        |
| [**getPartnerLocationsByClientId**](PartnersApi.md#getpartnerlocationsbyclientid)                     | **GET** /api/partners/{client_id}                             | Get partner locations by client id                    |
| [**getPartnersByRecreationResourceId**](PartnersApi.md#getpartnersbyrecreationresourceid)             | **GET** /api/partners/recreation-resources/{rec_resource_id}  | Get partners by recreation resource ID                |
| [**searchPartnerByClientId**](PartnersApi.md#searchpartnerbyclientid)                                 | **GET** /api/partners/search                                  | Search for partner by client id                       |
| [**searchPartners**](PartnersApi.md#searchpartners)                                                   | **GET** /api/partners/search/by                               | Search for partners                                   |
| [**updateRecreationResourceAgreementHolder**](PartnersApi.md#updaterecreationresourceagreementholder) | **PUT** /api/partners/recreation-resources/{rec_resource_id}  | Edit agreement holder dates for a recreation resource |

## createRecreationResourceAgreementHolder

> AgreementHolderClientPublicViewDto
> createRecreationResourceAgreementHolder(recResourceId,
> createAgreementHolderDto)

Add agreement holder for a recreation resource

Creates a new agreement holder record for the recreation resource when a client
is assigned.

### Example

```ts
import {
  Configuration,
  PartnersApi,
} from '';
import type { CreateRecreationResourceAgreementHolderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PartnersApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
    // CreateAgreementHolderDto | Agreement holder data to create
    createAgreementHolderDto: ...,
  } satisfies CreateRecreationResourceAgreementHolderRequest;

  try {
    const data = await api.createRecreationResourceAgreementHolder(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description                     | Notes                     |
| ---------------------------- | ------------------------------------------------------- | ------------------------------- | ------------------------- |
| **recResourceId**            | `string`                                                | Resource identifier             | [Defaults to `undefined`] |
| **createAgreementHolderDto** | [CreateAgreementHolderDto](CreateAgreementHolderDto.md) | Agreement holder data to create |                           |

### Return type

[**AgreementHolderClientPublicViewDto**](AgreementHolderClientPublicViewDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                  | Response headers |
| ----------- | ------------------------------------------------------------ | ---------------- |
| **201**     | Agreement holder created successfully                        | -                |
| **400**     | Bad Request - validation errors                              | -                |
| **404**     | Recreation resource or client not found                      | -                |
| **409**     | Agreement holder already exists for this recreation resource | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getPartnerLocationsByClientId

> Array&lt;ClientLocationDto&gt; getPartnerLocationsByClientId(clientId)

Get partner locations by client id

### Example

```ts
import {
  Configuration,
  PartnersApi,
} from '';
import type { GetPartnerLocationsByClientIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PartnersApi(config);

  const body = {
    // string
    clientId: 00000001,
  } satisfies GetPartnerLocationsByClientIdRequest;

  try {
    const data = await api.getPartnerLocationsByClientId(body);
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
| **clientId** | `string` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;ClientLocationDto&gt;**](ClientLocationDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | Returns a list of partner locations | -                |
| **404**     | Partner not found                   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getPartnersByRecreationResourceId

> Array&lt;AgreementHolderClientPublicViewDto&gt;
> getPartnersByRecreationResourceId(recResourceId)

Get partners by recreation resource ID

Looks up the agreement holder for the given recreation resource and returns
partner details for the associated client number.

### Example

```ts
import { Configuration, PartnersApi } from '';
import type { GetPartnersByRecreationResourceIdRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new PartnersApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
  } satisfies GetPartnersByRecreationResourceIdRequest;

  try {
    const data = await api.getPartnersByRecreationResourceId(body);
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

[**Array&lt;AgreementHolderClientPublicViewDto&gt;**](AgreementHolderClientPublicViewDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                                                 | Response headers |
| ----------- | ----------------------------------------------------------- | ---------------- |
| **200**     | Successfully retrieved partners for the recreation resource | -                |
| **400**     | Bad Request - invalid ID                                    | -                |
| **404**     | Recreation resource not found                               | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## searchPartnerByClientId

> ClientPublicViewDto searchPartnerByClientId(clientId)

Search for partner by client id

Looks up a single partner by client id using the forest client
findByClientNumber API. Returns active and inactive clients.

### Example

```ts
import {
  Configuration,
  PartnersApi,
} from '';
import type { SearchPartnerByClientIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PartnersApi(config);

  const body = {
    // string | A single client id, for example 00000002.
    clientId: 00000002,
  } satisfies SearchPartnerByClientIdRequest;

  try {
    const data = await api.searchPartnerByClientId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name         | Type     | Description                               | Notes                     |
| ------------ | -------- | ----------------------------------------- | ------------------------- |
| **clientId** | `string` | A single client id, for example 00000002. | [Defaults to `undefined`] |

### Return type

[**ClientPublicViewDto**](ClientPublicViewDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                    | Response headers |
| ----------- | ------------------------------ | ---------------- |
| **200**     | Successfully retrieved partner | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## searchPartners

> Array&lt;ClientPublicViewDto&gt; searchPartners(page, size, name, acronym,
> number)

Search for partners

Search for partners based on the provided parameters. It uses a fuzzy match to
search for the partner name. The cutout for the fuzzy match is 0.8. The search
is case insensitive.

### Example

```ts
import { Configuration, PartnersApi } from '';
import type { SearchPartnersRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new PartnersApi(config);

  const body = {
    // number (optional)
    page: 0,
    // number (optional)
    size: 10,
    // string (optional)
    name: name_example,
    // string (optional)
    acronym: acronym_example,
    // string (optional)
    number: number_example,
  } satisfies SearchPartnersRequest;

  try {
    const data = await api.searchPartners(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name        | Type     | Description | Notes                                |
| ----------- | -------- | ----------- | ------------------------------------ |
| **page**    | `number` |             | [Optional] [Defaults to `undefined`] |
| **size**    | `number` |             | [Optional] [Defaults to `undefined`] |
| **name**    | `string` |             | [Optional] [Defaults to `undefined`] |
| **acronym** | `string` |             | [Optional] [Defaults to `undefined`] |
| **number**  | `string` |             | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;ClientPublicViewDto&gt;**](ClientPublicViewDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                     | Response headers |
| ----------- | ------------------------------- | ---------------- |
| **200**     | Successfully retrieved partners | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateRecreationResourceAgreementHolder

> AgreementHolderClientPublicViewDto
> updateRecreationResourceAgreementHolder(recResourceId,
> updateAgreementHolderDto)

Edit agreement holder dates for a recreation resource

Updates the agreement start date and/or agreement end date for an existing
agreement holder record.

### Example

```ts
import {
  Configuration,
  PartnersApi,
} from '';
import type { UpdateRecreationResourceAgreementHolderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PartnersApi(config);

  const body = {
    // string | Resource identifier
    recResourceId: REC0002,
    // UpdateAgreementHolderDto | Agreement holder fields to update
    updateAgreementHolderDto: ...,
  } satisfies UpdateRecreationResourceAgreementHolderRequest;

  try {
    const data = await api.updateRecreationResourceAgreementHolder(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description                       | Notes                     |
| ---------------------------- | ------------------------------------------------------- | --------------------------------- | ------------------------- |
| **recResourceId**            | `string`                                                | Resource identifier               | [Defaults to `undefined`] |
| **updateAgreementHolderDto** | [UpdateAgreementHolderDto](UpdateAgreementHolderDto.md) | Agreement holder fields to update |                           |

### Return type

[**AgreementHolderClientPublicViewDto**](AgreementHolderClientPublicViewDto.md)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                           | Response headers |
| ----------- | ------------------------------------- | ---------------- |
| **200**     | Agreement holder updated successfully | -                |
| **400**     | Bad Request - validation errors       | -                |
| **404**     | Agreement holder not found            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
