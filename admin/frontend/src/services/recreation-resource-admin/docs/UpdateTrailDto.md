# UpdateTrailDto

## Properties

| Name          | Type   |
| ------------- | ------ |
| `trail_type`  | string |
| `name`        | string |
| `description` | object |

## Example

```typescript
import type { UpdateTrailDto } from ''

// TODO: Update the object below with actual values
const example = {
  "trail_type": BLUE,
  "name": Talladega Knight,
  "description": An accessible mountain bike trail suitable for all riders.,
} satisfies UpdateTrailDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateTrailDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
