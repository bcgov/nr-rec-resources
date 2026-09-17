# BcgwFeatureDto

## Properties

| Name         | Type                                                      |
| ------------ | --------------------------------------------------------- |
| `type`       | string                                                    |
| `geometry`   | object                                                    |
| `properties` | [BcgwRecreationResourceDto](BcgwRecreationResourceDto.md) |

## Example

```typescript
import type { BcgwFeatureDto } from '';

// TODO: Update the object below with actual values
const example = {
  type: Feature,
  geometry: { type: 'Point', coordinates: [-123.0935, 55.3237] },
  properties: null,
} satisfies BcgwFeatureDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwFeatureDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
