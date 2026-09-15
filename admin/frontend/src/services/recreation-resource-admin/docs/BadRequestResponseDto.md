# BadRequestResponseDto

## Properties

| Name         | Type                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `statusCode` | number                                                               |
| `message`    | string                                                               |
| `error`      | string                                                               |
| `timestamp`  | string                                                               |
| `path`       | string                                                               |
| `details`    | [Array&lt;ValidationErrorDetailDto&gt;](ValidationErrorDetailDto.md) |

## Example

```typescript
import type { BadRequestResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "statusCode": 404,
  "message": Resource Not Found,
  "error": Not Found,
  "timestamp": 2025-06-13T21:13:23.000Z,
  "path": /api/v1/users/invalid-input,
  "details": [{"field":"email","messages":["email must be an email"]},{"field":"password","messages":["password should not be empty","password must be longer than or equal to 6 characters"]}],
} satisfies BadRequestResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BadRequestResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
