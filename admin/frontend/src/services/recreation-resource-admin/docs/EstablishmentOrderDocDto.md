# EstablishmentOrderDocDto

## Properties

| Name              | Type   |
| ----------------- | ------ |
| `s3_key`          | string |
| `rec_resource_id` | string |
| `title`           | string |
| `file_size`       | number |
| `extension`       | string |
| `url`             | string |
| `created_at`      | Date   |

## Example

```typescript
import type { EstablishmentOrderDocDto } from ''

// TODO: Update the object below with actual values
const example = {
  "s3_key": REC0001/establishment-order.pdf,
  "rec_resource_id": REC0001,
  "title": Establishment Order 2024,
  "file_size": 1024000,
  "extension": pdf,
  "url": https://s3.amazonaws.com/...,
  "created_at": 2024-01-01T00:00Z,
} satisfies EstablishmentOrderDocDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EstablishmentOrderDocDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
