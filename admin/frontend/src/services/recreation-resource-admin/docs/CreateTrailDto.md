# CreateTrailDto

## Properties

| Name                       | Type   |
| -------------------------- | ------ |
| `recreation_activity_code` | number |
| `trail_type`               | string |
| `name`                     | string |
| `description`              | string |

## Example

```typescript
import type { CreateTrailDto } from ''

// TODO: Update the object below with actual values
const example = {
  "recreation_activity_code": 34,
  "trail_type": BLUE,
  "name": Talladega Knight,
  "description": An accessible mountain bike trail suitable for all riders.,
} satisfies CreateTrailDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateTrailDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
