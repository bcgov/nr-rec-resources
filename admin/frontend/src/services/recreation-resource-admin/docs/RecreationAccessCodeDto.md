# RecreationAccessCodeDto

## Properties

| Name               | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| `code`             | string                                                                   |
| `description`      | string                                                                   |
| `sub_access_codes` | [Array&lt;RecreationSubAccessCodeDto&gt;](RecreationSubAccessCodeDto.md) |

## Example

```typescript
import type { RecreationAccessCodeDto } from '';

// TODO: Update the object below with actual values
const example = {
  code: R,
  description: Road,
  sub_access_codes: null,
} satisfies RecreationAccessCodeDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationAccessCodeDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
