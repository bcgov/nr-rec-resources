# ExhibitADocDto

## Properties

| Name              | Type   |
| ----------------- | ------ |
| `document_id`     | string |
| `rec_resource_id` | string |
| `file_name`       | string |
| `extension`       | string |
| `file_size`       | number |
| `s3_key`          | string |
| `url`             | string |
| `created_at`      | Date   |

## Example

```typescript
import type { ExhibitADocDto } from ''

// TODO: Update the object below with actual values
const example = {
  "document_id": a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  "rec_resource_id": REC0001,
  "file_name": exhibit-a-2024,
  "extension": pdf,
  "file_size": 1024000,
  "s3_key": REC0001/exhibit-a-2024.pdf,
  "url": https://s3.amazonaws.com/...,
  "created_at": null,
} satisfies ExhibitADocDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExhibitADocDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
