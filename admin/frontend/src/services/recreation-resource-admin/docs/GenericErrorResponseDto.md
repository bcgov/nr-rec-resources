# GenericErrorResponseDto

## Properties

| Name         | Type   |
| ------------ | ------ |
| `statusCode` | number |
| `message`    | string |
| `error`      | string |
| `timestamp`  | string |
| `path`       | string |

## Example

```typescript
import type { GenericErrorResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "statusCode": 404,
  "message": Resource Not Found,
  "error": Not Found,
  "timestamp": 2025-06-13T21:13:23.000Z,
  "path": /api/v1/users/invalid-input,
} satisfies GenericErrorResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GenericErrorResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
