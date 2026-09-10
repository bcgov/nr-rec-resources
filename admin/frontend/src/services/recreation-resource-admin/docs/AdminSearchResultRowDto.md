# AdminSearchResultRowDto

## Properties

| Name                            | Type                |
| ------------------------------- | ------------------- |
| `rec_resource_id`               | string              |
| `name`                          | string              |
| `recreation_resource_type`      | string              |
| `recreation_resource_type_code` | string              |
| `district_description`          | string              |
| `display_on_public_site`        | boolean             |
| `closest_community`             | string              |
| `status`                        | string              |
| `status_code`                   | number              |
| `rec_status_code`               | string              |
| `rec_status_description`        | string              |
| `access_types`                  | Array&lt;string&gt; |
| `activities`                    | Array&lt;string&gt; |
| `fee_indicators`                | Array&lt;string&gt; |
| `established_date`              | string              |
| `updated_at`                    | string              |
| `campsite_count`                | number              |
| `access_status_grouplabel`      | string              |

## Example

```typescript
import type { AdminSearchResultRowDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": REC204118,
  "name": Tamihi East Campground,
  "recreation_resource_type": Campground,
  "recreation_resource_type_code": SIT,
  "district_description": Chilliwack Natural Resource District,
  "display_on_public_site": true,
  "closest_community": Hope,
  "status": Open,
  "status_code": 1,
  "rec_status_code": HI,
  "rec_status_description": Issued,
  "access_types": ["Road","4WD"],
  "activities": ["Hiking","Fishing"],
  "fee_indicators": ["Reservable","Has fees"],
  "established_date": 2021-05-12,
  "updated_at": 2021-05-12,
  "campsite_count": 24,
  "access_status_grouplabel": Open,
} satisfies AdminSearchResultRowDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdminSearchResultRowDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
