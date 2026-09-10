# UpdateAgreementHolderDto

## Properties

| Name                 | Type   |
| -------------------- | ------ |
| `agreementStartDate` | string |
| `agreementEndDate`   | string |

## Example

```typescript
import type { UpdateAgreementHolderDto } from ''

// TODO: Update the object below with actual values
const example = {
  "agreementStartDate": 2024-01-01,
  "agreementEndDate": 2026-12-31,
} satisfies UpdateAgreementHolderDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateAgreementHolderDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
