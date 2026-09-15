# BcgwRecreationPolygonsFeatureDto

## Properties

| Name         | Type                                                      |
| ------------ | --------------------------------------------------------- |
| `type`       | string                                                    |
| `geometry`   | object                                                    |
| `properties` | [BcgwRecreationPolygonsDto](BcgwRecreationPolygonsDto.md) |

## Example

```typescript
import type { BcgwRecreationPolygonsFeatureDto } from '';

// TODO: Update the object below with actual values
const example = {
  type: Feature,
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-121.9, 49.6],
        [-121.85, 49.6],
        [-121.85, 49.65],
        [-121.9, 49.65],
        [-121.9, 49.6],
      ],
    ],
  },
  properties: null,
} satisfies BcgwRecreationPolygonsFeatureDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as BcgwRecreationPolygonsFeatureDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
