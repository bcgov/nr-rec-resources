# CreateRecreationFeeDto

## Properties

| Name                      | Type    |
| ------------------------- | ------- |
| `recreation_fee_code`     | string  |
| `recreation_fee_sub_code` | string  |
| `fee_amount`              | number  |
| `fee_start_date`          | string  |
| `fee_end_date`            | string  |
| `monday_ind`              | string  |
| `tuesday_ind`             | string  |
| `wednesday_ind`           | string  |
| `thursday_ind`            | string  |
| `friday_ind`              | string  |
| `saturday_ind`            | string  |
| `sunday_ind`              | string  |
| `recurring_ind`           | boolean |
| `recurring_start_mmdd`    | string  |
| `recurring_end_mmdd`      | string  |

## Example

```typescript
import type { CreateRecreationFeeDto } from ''

// TODO: Update the object below with actual values
const example = {
  "recreation_fee_code": C,
  "recreation_fee_sub_code": CAMPING,
  "fee_amount": 15.5,
  "fee_start_date": 2024-06-01,
  "fee_end_date": 2024-09-30,
  "monday_ind": N,
  "tuesday_ind": N,
  "wednesday_ind": N,
  "thursday_ind": N,
  "friday_ind": N,
  "saturday_ind": N,
  "sunday_ind": N,
  "recurring_ind": false,
  "recurring_start_mmdd": 06-01,
  "recurring_end_mmdd": 08-31,
} satisfies CreateRecreationFeeDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateRecreationFeeDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
