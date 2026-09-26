# BcgwClosuresShortDto

## Properties

| Name                       | Type   |
| -------------------------- | ------ |
| `rec_resource_id`          | string |
| `rec_resource_name`        | string |
| `rec_resource_type`        | string |
| `closure_ind`              | string |
| `closure_date`             | Date   |
| `closure_type`             | string |
| `closest_community`        | string |
| `defined_campsites`        | number |
| `recreation_district_code` | string |
| `recreation_district_name` | string |
| `org_unit_name`            | string |
| `closure_comment`          | string |
| `site_description`         | string |
| `driving_directions`       | string |
| `latitude`                 | number |
| `longitude`                | number |
| `shape`                    | string |

## Example

```typescript
import type { BcgwClosuresShortDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": REC204117,
  "rec_resource_name": null,
  "rec_resource_type": SIT - Recreation Site,
  "closure_ind": N,
  "closure_date": null,
  "closure_type": Wildfire,
  "closest_community": PEMBERTON,
  "defined_campsites": 0,
  "recreation_district_code": RDPG,
  "recreation_district_name": Prince George-Mackenzie,
  "org_unit_name": null,
  "closure_comment": null,
  "site_description": null,
  "driving_directions": null,
  "latitude": 55.3237,
  "longitude": -123.0935,
  "shape": {"type":"Point","coordinates":[-123.0935,55.3237]},
} satisfies BcgwClosuresShortDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwClosuresShortDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
