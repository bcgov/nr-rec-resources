# ValidationErrorDetailDto

## Properties

| Name       | Type                |
| ---------- | ------------------- |
| `field`    | string              |
| `messages` | Array&lt;string&gt; |

## Example

```typescript
import type { ValidationErrorDetailDto } from '';

// TODO: Update the object below with actual values
const example = {
  field: name,
  messages: [
    'name must be longer than or equal to 3 characters',
    'name should not be empty',
  ],
} satisfies ValidationErrorDetailDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ValidationErrorDetailDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
