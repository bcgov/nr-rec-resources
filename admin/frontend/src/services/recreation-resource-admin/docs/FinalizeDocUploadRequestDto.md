# FinalizeDocUploadRequestDto

## Properties

| Name          | Type   |
| ------------- | ------ |
| `document_id` | string |
| `file_name`   | string |
| `extension`   | string |
| `file_size`   | number |
| `doc_code`    | string |

## Example

```typescript
import type { FinalizeDocUploadRequestDto } from ''

// TODO: Update the object below with actual values
const example = {
  "document_id": a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  "file_name": campbell-river-site-map.pdf,
  "extension": pdf,
  "file_size": 2097152,
  "doc_code": RM,
} satisfies FinalizeDocUploadRequestDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FinalizeDocUploadRequestDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
