# RecreationStatusDto

## Properties

| Name          | Type   |
| ------------- | ------ |
| `status_code` | number |
| `comment`     | string |
| `description` | string |

## Example

```typescript
import type { RecreationStatusDto } from ''

// TODO: Update the object below with actual values
const example = {
  "status_code": null,
  "comment": Temporary closure due to weather conditions,
  "description": The facility is currently closed to visitors,
} satisfies RecreationStatusDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationStatusDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
