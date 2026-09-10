# UpdateRecreationResourceReservationDto

## Properties

| Name                       | Type   |
| -------------------------- | ------ |
| `reservation_website`      | string |
| `reservation_phone_number` | string |
| `reservation_email`        | string |

## Example

```typescript
import type { UpdateRecreationResourceReservationDto } from ''

// TODO: Update the object below with actual values
const example = {
  "reservation_website": www.firesidecamping.ca,
  "reservation_phone_number": 250-555-1234,
  "reservation_email": reservation@email.com,
} satisfies UpdateRecreationResourceReservationDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateRecreationResourceReservationDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
