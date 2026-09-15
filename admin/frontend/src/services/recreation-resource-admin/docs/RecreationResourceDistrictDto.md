# RecreationResourceDistrictDto

## Properties

| Name            | Type   |
| --------------- | ------ |
| `district_code` | string |
| `description`   | string |

## Example

```typescript
import type { RecreationResourceDistrictDto } from '';

// TODO: Update the object below with actual values
const example = {
  district_code: RDCK,
  description: Chilliwack,
} satisfies RecreationResourceDistrictDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceDistrictDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
