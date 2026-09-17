# BcgwClosuresShortFeatureDto

## Properties

| Name         | Type                                            |
| ------------ | ----------------------------------------------- |
| `type`       | string                                          |
| `geometry`   | object                                          |
| `properties` | [BcgwClosuresShortDto](BcgwClosuresShortDto.md) |

## Example

```typescript
import type { BcgwClosuresShortFeatureDto } from '';

// TODO: Update the object below with actual values
const example = {
  type: Feature,
  geometry: { type: 'Point', coordinates: [-123.0935, 55.3237] },
  properties: null,
} satisfies BcgwClosuresShortFeatureDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwClosuresShortFeatureDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
