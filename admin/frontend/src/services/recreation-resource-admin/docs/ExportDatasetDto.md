# ExportDatasetDto

## Properties

| Name     | Type   |
| -------- | ------ |
| `id`     | string |
| `label`  | string |
| `source` | string |
| `info`   | string |

## Example

```typescript
import type { ExportDatasetDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": file-details,
  "label": File details,
  "source": RST,
  "info": ROLLUP_REGION_NO, ROLLUP_REGION_CODE, and FOREST_REGION are currently blank.,
} satisfies ExportDatasetDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExportDatasetDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
