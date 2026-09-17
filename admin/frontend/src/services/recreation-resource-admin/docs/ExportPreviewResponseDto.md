# ExportPreviewResponseDto

## Properties

| Name      | Type                             |
| --------- | -------------------------------- | ----------- |
| `columns` | Array&lt;string&gt;              |
| `rows`    | Array&lt;{ [key: string]: string | null; }&gt; |

## Example

```typescript
import type { ExportPreviewResponseDto } from '';

// TODO: Update the object below with actual values
const example = {
  columns: null,
  rows: [
    { rec_resource_id: 'REC0001', resource_name: 'Sample recreation resource' },
  ],
} satisfies ExportPreviewResponseDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExportPreviewResponseDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
