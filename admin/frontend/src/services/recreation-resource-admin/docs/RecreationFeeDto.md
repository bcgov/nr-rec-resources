# RecreationFeeDto

## Properties

| Name                       | Type    |
| -------------------------- | ------- |
| `fee_id`                   | number  |
| `fee_amount`               | number  |
| `fee_start_date`           | Date    |
| `fee_end_date`             | Date    |
| `recreation_fee_code`      | string  |
| `fee_type_description`     | string  |
| `recreation_fee_sub_code`  | string  |
| `fee_sub_type_description` | string  |
| `monday_ind`               | string  |
| `tuesday_ind`              | string  |
| `wednesday_ind`            | string  |
| `thursday_ind`             | string  |
| `friday_ind`               | string  |
| `saturday_ind`             | string  |
| `sunday_ind`               | string  |
| `recurring_ind`            | boolean |
| `recurring_start_mmdd`     | string  |
| `recurring_end_mmdd`       | string  |

## Example

```typescript
import type { RecreationFeeDto } from ''

// TODO: Update the object below with actual values
const example = {
  "fee_id": 123,
  "fee_amount": 15,
  "fee_start_date": null,
  "fee_end_date": null,
  "recreation_fee_code": C,
  "fee_type_description": Camping,
  "recreation_fee_sub_code": CAMPING,
  "fee_sub_type_description": Camping,
  "monday_ind": Y,
  "tuesday_ind": Y,
  "wednesday_ind": Y,
  "thursday_ind": Y,
  "friday_ind": Y,
  "saturday_ind": Y,
  "sunday_ind": Y,
  "recurring_ind": false,
  "recurring_start_mmdd": 06-01,
  "recurring_end_mmdd": 08-31,
} satisfies RecreationFeeDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationFeeDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
