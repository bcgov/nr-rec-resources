# RecreationActivityDto

## Properties

| Name                       | Type    |
| -------------------------- | ------- |
| `recreation_activity_code` | number  |
| `description`              | string  |
| `is_accessible`            | boolean |
| `details`                  | string  |

## Example

```typescript
import type { RecreationActivityDto } from ''

// TODO: Update the object below with actual values
const example = {
  "recreation_activity_code": null,
  "description": Hiking trails available for all skill levels,
  "is_accessible": false,
  "details": Adaptive mountain biking trails with wide paths,
} satisfies RecreationActivityDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationActivityDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
