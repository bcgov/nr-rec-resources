# UpdateRecreationAccessCodeDto

## Properties

| Name               | Type                |
| ------------------ | ------------------- |
| `access_code`      | string              |
| `sub_access_codes` | Array&lt;string&gt; |

## Example

```typescript
import type { UpdateRecreationAccessCodeDto } from '';

// TODO: Update the object below with actual values
const example = {
  access_code: R,
  sub_access_codes: ['4W'],
} satisfies UpdateRecreationAccessCodeDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateRecreationAccessCodeDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
