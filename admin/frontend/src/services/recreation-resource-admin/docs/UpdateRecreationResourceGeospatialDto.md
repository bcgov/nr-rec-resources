# UpdateRecreationResourceGeospatialDto

## Properties

| Name           | Type   |
| -------------- | ------ |
| `utm_zone`     | number |
| `utm_easting`  | number |
| `utm_northing` | number |

## Example

```typescript
import type { UpdateRecreationResourceGeospatialDto } from '';

// TODO: Update the object below with actual values
const example = {
  utm_zone: 10,
  utm_easting: 500000,
  utm_northing: 5450000,
} satisfies UpdateRecreationResourceGeospatialDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as UpdateRecreationResourceGeospatialDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
