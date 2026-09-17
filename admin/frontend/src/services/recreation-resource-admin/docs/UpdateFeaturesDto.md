# UpdateFeaturesDto

## Properties

| Name            | Type                |
| --------------- | ------------------- |
| `feature_codes` | Array&lt;string&gt; |

## Example

```typescript
import type { UpdateFeaturesDto } from '';

// TODO: Update the object below with actual values
const example = {
  feature_codes: ['A1', 'B2', 'X0'],
} satisfies UpdateFeaturesDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateFeaturesDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
