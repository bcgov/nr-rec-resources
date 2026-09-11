# RecreationResourceAdvisoryDto

## Properties

| Name                          | Type    |
| ----------------------------- | ------- |
| `advisory_number`             | number  |
| `event_type`                  | string  |
| `access_status_name`          | string  |
| `advisory_status`             | string  |
| `urgency`                     | string  |
| `advisory_date`               | Date    |
| `effective_date`              | Date    |
| `end_date`                    | Date    |
| `expiry_date`                 | Date    |
| `updated_date`                | Date    |
| `published_at`                | Date    |
| `submitted_by`                | string  |
| `is_advisory_date_displayed`  | boolean |
| `is_effective_date_displayed` | boolean |
| `is_end_date_displayed`       | boolean |
| `is_updated_date_displayed`   | boolean |

## Example

```typescript
import type { RecreationResourceAdvisoryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "advisory_number": 12345,
  "event_type": General Public Safety,
  "access_status_name": Closure,
  "advisory_status": Published,
  "urgency": High,
  "advisory_date": null,
  "effective_date": null,
  "end_date": null,
  "expiry_date": null,
  "updated_date": null,
  "published_at": null,
  "submitted_by": Jane Doe,
  "is_advisory_date_displayed": true,
  "is_effective_date_displayed": true,
  "is_end_date_displayed": false,
  "is_updated_date_displayed": true,
} satisfies RecreationResourceAdvisoryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceAdvisoryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
