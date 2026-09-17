# ActAdvisoryUpsertDto

## Properties

| Name                          | Type    |
| ----------------------------- | ------- |
| `rec_resource_id`             | string  |
| `advisory_number`             | number  |
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
import type { ActAdvisoryUpsertDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": REC0002,
  "advisory_number": 3791,
  "title": Bear in area,
  "description": A black bear has been spotted near the main campground. Please use bear-safe storage.,
  "submitted_by": jdoe,
  "access_status_name": Open with restrictions,
  "access_status_grouplabel": Open,
  "access_status_description": The site is open but some trails are closed.,
  "event_type": Wildlife,
  "urgency": High,
  "advisory_status": Published,
  "is_reservations_affected": false,
  "is_advisory_date_displayed": true,
  "is_effective_date_displayed": true,
  "is_end_date_displayed": false,
  "is_updated_date_displayed": true,
  "advisory_date": 2026-06-01T15:00:00.000Z,
  "effective_date": 2026-06-02T00:00:00.000Z,
  "end_date": 2026-09-30T23:59:59.000Z,
  "expiry_date": 2026-10-31T23:59:59.000Z,
  "removal_date": 2026-11-15T00:00:00.000Z,
  "updated_date": 2026-06-05T08:30:00.000Z,
  "modified_date": 2026-06-05T08:30:00.000Z,
  "published_at": 2026-06-02T00:00:00.000Z,
  "published_date": 2026-06-02T00:00:00.000Z,
  "listing_rank": 0,
  "urgency_sequence": 0,
  "access_status_precedence": 0,
  "event_type_precedence": 0,
} satisfies ActAdvisoryUpsertDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ActAdvisoryUpsertDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
