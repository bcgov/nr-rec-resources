# BcgwPaginationMetaDto

## Properties

| Name         | Type   |
| ------------ | ------ |
| `total`      | number |
| `page`       | number |
| `totalPages` | number |
| `pageSize`   | number |

## Example

```typescript
import type { BcgwPaginationMetaDto } from '';

// TODO: Update the object below with actual values
const example = {
  total: 2500,
  page: 1,
  totalPages: 3,
  pageSize: 1000,
} satisfies BcgwPaginationMetaDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwPaginationMetaDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
