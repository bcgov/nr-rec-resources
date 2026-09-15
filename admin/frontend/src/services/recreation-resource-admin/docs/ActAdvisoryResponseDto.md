# ActAdvisoryResponseDto

## Properties

| Name              | Type   |
| ----------------- | ------ |
| `rec_resource_id` | string |
| `advisory_number` | number |
| `action`          | string |
| `timestamp`       | string |

## Example

```typescript
import type { ActAdvisoryResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": REC0002,
  "advisory_number": 3791,
  "action": created,
  "timestamp": 2026-06-10T18:30:00.000Z,
} satisfies ActAdvisoryResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ActAdvisoryResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
