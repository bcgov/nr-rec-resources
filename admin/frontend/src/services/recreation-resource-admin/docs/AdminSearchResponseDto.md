# AdminSearchResponseDto

## Properties

| Name        | Type                                                               |
| ----------- | ------------------------------------------------------------------ |
| `data`      | [Array&lt;AdminSearchResultRowDto&gt;](AdminSearchResultRowDto.md) |
| `total`     | number                                                             |
| `page`      | number                                                             |
| `page_size` | number                                                             |

## Example

```typescript
import type { AdminSearchResponseDto } from '';

// TODO: Update the object below with actual values
const example = {
  data: null,
  total: 137,
  page: 1,
  page_size: 25,
} satisfies AdminSearchResponseDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdminSearchResponseDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
