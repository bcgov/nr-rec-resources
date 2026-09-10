# HealthControllerCheck503Response

## Properties

| Name      | Type                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| `status`  | string                                                                                                        |
| `info`    | [{ [key: string]: HealthControllerCheck200ResponseInfoValue; }](HealthControllerCheck200ResponseInfoValue.md) |
| `error`   | [{ [key: string]: HealthControllerCheck200ResponseInfoValue; }](HealthControllerCheck200ResponseInfoValue.md) |
| `details` | [{ [key: string]: HealthControllerCheck200ResponseInfoValue; }](HealthControllerCheck200ResponseInfoValue.md) |

## Example

```typescript
import type { HealthControllerCheck503Response } from '';

// TODO: Update the object below with actual values
const example = {
  status: error,
  info: { database: { status: 'up' } },
  error: { redis: { status: 'down', message: 'Could not connect' } },
  details: {
    database: { status: 'up' },
    redis: { status: 'down', message: 'Could not connect' },
  },
} satisfies HealthControllerCheck503Response;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as HealthControllerCheck503Response;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
