# ClientLocationDto

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
| `locationCode`            | string |
| `locationName`            | string |
| `companyCode`             | string |
| `address1`                | string |
| `address2`                | string |
| `address3`                | string |
| `city`                    | string |
| `province`                | string |
| `postalCode`              | string |
| `country`                 | string |
| `homePhone`               | string |
| `businessPhone`           | string |
| `cellPhone`               | string |
| `faxNumber`               | string |
| `email`                   | string |
| `expired`                 | string |
| `trusted`                 | string |
| `returnedMailDate`        | string |
| `comment`                 | string |

## Example

```typescript
import type { ClientLocationDto } from ''

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
  "locationCode": 00,
  "locationName": Office,
  "companyCode": 01382,
  "address1": 2080 Labieux Rd,
  "address2": null,
  "address3": null,
  "city": NANAIMO,
  "province": BC,
  "postalCode": V9T6J9,
  "country": CANADA,
  "homePhone": 8006618773,
  "businessPhone": null,
  "cellPhone": null,
  "faxNumber": null,
  "email": null,
  "expired": N,
  "trusted": N,
  "returnedMailDate": null,
  "comment": null,
} satisfies ClientLocationDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ClientLocationDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
