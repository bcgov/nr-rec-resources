# RecreationResourceDocDto

## Properties

| Name                   | Type   |
| ---------------------- | ------ |
| `document_id`          | string |
| `file_name`            | string |
| `rec_resource_id`      | string |
| `url`                  | string |
| `doc_code`             | string |
| `doc_code_description` | string |
| `extension`            | string |
| `created_at`           | string |

## Example

```typescript
import type { RecreationResourceDocDto } from '';

// TODO: Update the object below with actual values
const example = {
  document_id: 1000,
  file_name: campbell - river - site - map.pdf,
  rec_resource_id: null,
  url: null,
  doc_code: RM,
  doc_code_description: null,
  extension: null,
  created_at: null,
} satisfies RecreationResourceDocDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceDocDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
