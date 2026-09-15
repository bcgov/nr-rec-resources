# AgreementHolderClientPublicViewDto

## Properties

| Name                      | Type   |
| ------------------------- | ------ |
| `clientNumber`            | string |
| `clientName`              | string |
| `legalFirstName`          | string |
| `legalMiddleName`         | string |
| `clientStatusCode`        | string |
| `clientStatusDescription` | string |
| `clientTypeCode`          | string |
| `clientTypeDescription`   | string |
| `acronym`                 | string |
| `agreementStartDate`      | string |
| `agreementEndDate`        | string |

## Example

```typescript
import type { AgreementHolderClientPublicViewDto } from ''

// TODO: Update the object below with actual values
const example = {
  "clientNumber": 00000002,
  "clientName": BAXTER,
  "legalFirstName": JAMES,
  "legalMiddleName": Canter,
  "clientStatusCode": ACT,
  "clientStatusDescription": Active,
  "clientTypeCode": I,
  "clientTypeDescription": Individual,
  "acronym": JAMES BAXTER,
  "agreementStartDate": 2024-01-01,
  "agreementEndDate": 2026-12-31,
} satisfies AgreementHolderClientPublicViewDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AgreementHolderClientPublicViewDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
