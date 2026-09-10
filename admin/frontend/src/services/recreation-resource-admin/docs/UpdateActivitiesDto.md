# UpdateActivitiesDto

## Properties

| Name             | Type                |
| ---------------- | ------------------- |
| `activity_codes` | Array&lt;number&gt; |

## Example

```typescript
import type { UpdateActivitiesDto } from '';

// TODO: Update the object below with actual values
const example = {
  activity_codes: [1, 2, 3],
} satisfies UpdateActivitiesDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateActivitiesDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
