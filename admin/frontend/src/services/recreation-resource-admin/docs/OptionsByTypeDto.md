# OptionsByTypeDto

## Properties

| Name      | Type                                   |
| --------- | -------------------------------------- |
| `type`    | string                                 |
| `options` | [Array&lt;OptionDto&gt;](OptionDto.md) |

## Example

```typescript
import type { OptionsByTypeDto } from '';

// TODO: Update the object below with actual values
const example = {
  type: activities,
  options: null,
} satisfies OptionsByTypeDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OptionsByTypeDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
