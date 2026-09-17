# RecreationAssetCodeDto

## Properties

| Name            | Type    |
| --------------- | ------- |
| `asset_code`    | number  |
| `description`   | string  |
| `has_length`    | boolean |
| `has_width`     | boolean |
| `has_area`      | boolean |
| `default_value` | object  |

## Example

```typescript
import type { RecreationAssetCodeDto } from '';

// TODO: Update the object below with actual values
const example = {
  asset_code: 1,
  description: Table - log,
  has_length: true,
  has_width: false,
  has_area: false,
  default_value: 300,
} satisfies RecreationAssetCodeDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationAssetCodeDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
