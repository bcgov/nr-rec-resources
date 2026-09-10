# CreateAgreementHolderDto

## Properties

| Name                 | Type   |
| -------------------- | ------ |
| `agreementStartDate` | string |
| `agreementEndDate`   | string |
| `clientNumber`       | string |

## Example

```typescript
import type { CreateAgreementHolderDto } from ''

// TODO: Update the object below with actual values
const example = {
  "agreementStartDate": 2024-01-01,
  "agreementEndDate": 2026-12-31,
  "clientNumber": 00000002,
} satisfies CreateAgreementHolderDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateAgreementHolderDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
