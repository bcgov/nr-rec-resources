# RecreationStructureDto

## Properties

| Name         | Type    |
| ------------ | ------- |
| `has_toilet` | boolean |
| `has_table`  | boolean |

## Example

```typescript
import type { RecreationStructureDto } from '';

// TODO: Update the object below with actual values
const example = {
  has_toilet: false,
  has_table: false,
} satisfies RecreationStructureDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationStructureDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
