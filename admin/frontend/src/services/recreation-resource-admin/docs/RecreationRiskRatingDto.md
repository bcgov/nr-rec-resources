# RecreationRiskRatingDto

## Properties

| Name               | Type   |
| ------------------ | ------ |
| `risk_rating_code` | string |
| `description`      | string |

## Example

```typescript
import type { RecreationRiskRatingDto } from '';

// TODO: Update the object below with actual values
const example = {
  risk_rating_code: H,
  description: High,
} satisfies RecreationRiskRatingDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationRiskRatingDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
