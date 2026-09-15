# OptionDto

## Properties

| Name          | Type                                   |
| ------------- | -------------------------------------- |
| `id`          | string                                 |
| `label`       | string                                 |
| `children`    | [Array&lt;OptionDto&gt;](OptionDto.md) |
| `is_archived` | boolean                                |

## Example

```typescript
import type { OptionDto } from '';

// TODO: Update the object below with actual values
const example = {
  id: hiking,
  label: Hiking,
  children: [
    { id: 'hiking_trail', label: 'Hiking Trail' },
    { id: 'hiking_backcountry', label: 'Backcountry Hiking' },
  ],
  is_archived: false,
} satisfies OptionDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OptionDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
