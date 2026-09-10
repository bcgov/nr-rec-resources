# AppApi

All URIs are relative to _http://localhost_

| Method                                                       | HTTP request | Description |
| ------------------------------------------------------------ | ------------ | ----------- |
| [**appControllerGetHello**](AppApi.md#appcontrollergethello) | **GET** /api |             |

## appControllerGetHello

> appControllerGetHello()

### Example

```ts
import { Configuration, AppApi } from '';
import type { AppControllerGetHelloRequest } from '';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: keycloak
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new AppApi(config);

  try {
    const data = await api.appControllerGetHello();
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

`void` (Empty response body)

### Authorization

[keycloak](../README.md#keycloak)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
