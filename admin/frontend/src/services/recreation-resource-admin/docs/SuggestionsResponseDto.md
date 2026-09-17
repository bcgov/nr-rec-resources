# SuggestionsResponseDto

## Properties

| Name          | Type                                           |
| ------------- | ---------------------------------------------- |
| `total`       | number                                         |
| `suggestions` | [Array&lt;SuggestionDto&gt;](SuggestionDto.md) |

## Example

```typescript
import type { SuggestionsResponseDto } from '';

// TODO: Update the object below with actual values
const example = {
  total: 123,
  suggestions: null,
} satisfies SuggestionsResponseDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SuggestionsResponseDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
