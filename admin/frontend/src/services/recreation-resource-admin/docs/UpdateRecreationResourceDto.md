# UpdateRecreationResourceDto

## Properties

| Name                         | Type                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `maintenance_standard_code`  | string                                                                         |
| `control_access_code`        | string                                                                         |
| `risk_rating_code`           | string                                                                         |
| `project_established_date`   | string                                                                         |
| `access_codes`               | [Array&lt;UpdateRecreationAccessCodeDto&gt;](UpdateRecreationAccessCodeDto.md) |
| `status_code`                | number                                                                         |
| `district_code`              | string                                                                         |
| `closest_community`          | string                                                                         |
| `display_on_public_site`     | boolean                                                                        |
| `site_description`           | string                                                                         |
| `driving_directions`         | string                                                                         |
| `name`                       | string                                                                         |
| `last_rec_inspection_date`   | string                                                                         |
| `last_hzrd_tree_assess_date` | string                                                                         |

## Example

```typescript
import type { UpdateRecreationResourceDto } from ''

// TODO: Update the object below with actual values
const example = {
  "maintenance_standard_code": M,
  "control_access_code": G,
  "risk_rating_code": H,
  "project_established_date": 2024-01-15,
  "access_codes": null,
  "status_code": 1,
  "district_code": CHWK,
  "closest_community": Port Hardy,
  "display_on_public_site": true,
  "site_description": <p>This is a beautiful site with many amenities.</p>,
  "driving_directions": <p>Take Highway 1 east, then turn left at Main St.</p>,
  "name": Port Hardy Recreation Area,
  "last_rec_inspection_date": 2024-06-15,
  "last_hzrd_tree_assess_date": 2024-06-15,
} satisfies UpdateRecreationResourceDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateRecreationResourceDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
