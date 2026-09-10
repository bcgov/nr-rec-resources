# HealthApi

All URIs are relative to _http://localhost_

| Method                                                          | HTTP request        | Description |
| --------------------------------------------------------------- | ------------------- | ----------- |
| [**healthControllerCheck**](HealthApi.md#healthcontrollercheck) | **GET** /api/health |             |

## healthControllerCheck

> HealthControllerCheck200Response healthControllerCheck()

### Example

```ts
import { Configuration, HealthApi } from '';
import type { HealthControllerCheckRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const api = new HealthApi();

  try {
    const data = await api.healthControllerCheck();
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

[**HealthControllerCheck200Response**](HealthControllerCheck200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                        | Response headers |
| ----------- | ---------------------------------- | ---------------- |
| **200**     | The Health Check is successful     | -                |
| **503**     | The Health Check is not successful | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
