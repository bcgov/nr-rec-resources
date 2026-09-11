# ListExportDatasetsResponseDto

## Properties

| Name       | Type                                                 |
| ---------- | ---------------------------------------------------- |
| `datasets` | [Array&lt;ExportDatasetDto&gt;](ExportDatasetDto.md) |

## Example

```typescript
import type { ListExportDatasetsResponseDto } from '';

// TODO: Update the object below with actual values
const example = {
  datasets: null,
} satisfies ListExportDatasetsResponseDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ListExportDatasetsResponseDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
