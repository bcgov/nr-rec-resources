# RecreationResourceReservationInfoDto

## Properties

| Name                       | Type   |
| -------------------------- | ------ |
| `rec_resource_id`          | string |
| `reservation_website`      | string |
| `reservation_phone_number` | string |
| `reservation_email`        | string |

## Example

```typescript
import type { RecreationResourceReservationInfoDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": REC123,
  "reservation_website": www.firesidecamping.ca,
  "reservation_phone_number": (999)999-9999,
  "reservation_email": reservation@email.com,
} satisfies RecreationResourceReservationInfoDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceReservationInfoDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
