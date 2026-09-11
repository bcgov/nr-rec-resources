# RecreationFeatureDto

## Properties

| Name                      | Type   |
| ------------------------- | ------ |
| `recreation_feature_code` | string |
| `description`             | string |

## Example

```typescript
import type { RecreationFeatureDto } from ''

// TODO: Update the object below with actual values
const example = {
  "recreation_feature_code": A1,
  "description": Sport Fish,
} satisfies RecreationFeatureDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationFeatureDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
