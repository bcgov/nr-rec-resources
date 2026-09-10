# RecreationResourceImageDto

## Properties

| Name                                 | Type                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `ref_id`                             | string                                                                                 |
| `image_id`                           | string                                                                                 |
| `file_name`                          | string                                                                                 |
| `recreation_resource_image_variants` | [Array&lt;RecreationResourceImageVariantDto&gt;](RecreationResourceImageVariantDto.md) |
| `created_at`                         | string                                                                                 |
| `file_size`                          | number                                                                                 |
| `date_taken`                         | string                                                                                 |
| `photographer_type`                  | string                                                                                 |
| `photographer_type_description`      | string                                                                                 |
| `photographer_name`                  | string                                                                                 |
| `contains_pii`                       | boolean                                                                                |
| `photographer_display_name`          | string                                                                                 |
| `has_consent_metadata`               | boolean                                                                                |

## Example

```typescript
import type { RecreationResourceImageDto } from ''

// TODO: Update the object below with actual values
const example = {
  "ref_id": 1000,
  "image_id": a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9,
  "file_name": scenic-mountain-view.webp,
  "recreation_resource_image_variants": null,
  "created_at": null,
  "file_size": 2097152,
  "date_taken": 2024-06-15,
  "photographer_type": STAFF,
  "photographer_type_description": Staff Member,
  "photographer_name": Test User,
  "contains_pii": false,
  "photographer_display_name": Test User,
  "has_consent_metadata": true,
} satisfies RecreationResourceImageDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceImageDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
