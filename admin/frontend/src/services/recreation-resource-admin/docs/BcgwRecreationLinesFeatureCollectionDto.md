# BcgwRecreationLinesFeatureCollectionDto

## Properties

| Name       | Type                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| `type`     | string                                                                         |
| `features` | [Array&lt;BcgwRecreationLinesFeatureDto&gt;](BcgwRecreationLinesFeatureDto.md) |
| `meta`     | [BcgwPaginationMetaDto](BcgwPaginationMetaDto.md)                              |

## Example

```typescript
import type { BcgwRecreationLinesFeatureCollectionDto } from '';

// TODO: Update the object below with actual values
const example = {
  type: FeatureCollection,
  features: null,
  meta: null,
} satisfies BcgwRecreationLinesFeatureCollectionDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as BcgwRecreationLinesFeatureCollectionDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
