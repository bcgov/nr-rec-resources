# PresignExhibitAUploadResponseDto

## Properties

| Name          | Type   |
| ------------- | ------ |
| `document_id` | string |
| `key`         | string |
| `url`         | string |

## Example

```typescript
import type { PresignExhibitAUploadResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "document_id": a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  "key": REC0001/a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9/exhibit-a.pdf,
  "url": null,
} satisfies PresignExhibitAUploadResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PresignExhibitAUploadResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
