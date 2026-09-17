# RecreationResourceImageVariantDto

## Properties

| Name        | Type   |
| ----------- | ------ |
| `size_code` | string |
| `url`       | string |
| `width`     | number |
| `height`    | number |
| `extension` | string |

## Example

```typescript
import type { RecreationResourceImageVariantDto } from ''

// TODO: Update the object below with actual values
const example = {
  "size_code": original,
  "url": https://example.com/image.jpg,
  "width": 1920,
  "height": 1080,
  "extension": jpg,
} satisfies RecreationResourceImageVariantDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceImageVariantDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
