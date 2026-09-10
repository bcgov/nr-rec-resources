# ActAdvisoryUpdateDto

## Properties

| Name                          | Type    |
| ----------------------------- | ------- |
| `title`                       | string  |
| `description`                 | string  |
| `submitted_by`                | string  |
| `access_status_name`          | string  |
| `access_status_grouplabel`    | string  |
| `access_status_description`   | string  |
| `event_type`                  | string  |
| `urgency`                     | string  |
| `advisory_status`             | string  |
| `is_reservations_affected`    | boolean |
| `is_advisory_date_displayed`  | boolean |
| `is_effective_date_displayed` | boolean |
| `is_end_date_displayed`       | boolean |
| `is_updated_date_displayed`   | boolean |
| `advisory_date`               | string  |
| `effective_date`              | string  |
| `end_date`                    | string  |
| `expiry_date`                 | string  |
| `removal_date`                | string  |
| `updated_date`                | string  |
| `modified_date`               | string  |
| `published_at`                | string  |
| `published_date`              | string  |
| `listing_rank`                | number  |
| `urgency_sequence`            | number  |
| `access_status_precedence`    | number  |
| `event_type_precedence`       | number  |

## Example

```typescript
import type { ActAdvisoryUpdateDto } from '';

// TODO: Update the object below with actual values
const example = {
  title: null,
  description: null,
  submitted_by: null,
  access_status_name: null,
  access_status_grouplabel: null,
  access_status_description: null,
  event_type: null,
  urgency: null,
  advisory_status: null,
  is_reservations_affected: null,
  is_advisory_date_displayed: null,
  is_effective_date_displayed: null,
  is_end_date_displayed: null,
  is_updated_date_displayed: null,
  advisory_date: null,
  effective_date: null,
  end_date: null,
  expiry_date: null,
  removal_date: null,
  updated_date: null,
  modified_date: null,
  published_at: null,
  published_date: null,
  listing_rank: null,
  urgency_sequence: null,
  access_status_precedence: null,
  event_type_precedence: null,
} satisfies ActAdvisoryUpdateDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ActAdvisoryUpdateDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
