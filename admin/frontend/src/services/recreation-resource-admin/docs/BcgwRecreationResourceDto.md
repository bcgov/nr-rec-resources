# BcgwRecreationResourceDto

## Properties

| Name                       | Type   |
| -------------------------- | ------ |
| `forest_file_id`           | string |
| `project_name`             | string |
| `project_type_code`        | string |
| `project_type`             | string |
| `project_established_date` | Date   |
| `closure_ind`              | string |
| `closure_date`             | Date   |
| `closure_type`             | string |
| `closure_comment`          | string |
| `recreation_view_ind`      | string |
| `file_status_st`           | string |
| `status_description`       | string |
| `site_location`            | string |
| `defined_campsites`        | number |
| `site_description_brief`   | string |
| `arch_impact_assess_ind`   | string |
| `tenure_app_total_area`    | number |
| `tenure_app_total_length`  | number |
| `site_description`         | string |
| `site_description_date`    | Date   |
| `driving_directions`       | string |
| `driving_directions_date`  | Date   |
| `rec_feature_code`         | string |
| `rec_feature_description`  | string |
| `recreation_district_code` | string |
| `recreation_district_name` | string |
| `org_unit_code`            | string |
| `org_unit_name`            | string |
| `utm_zone`                 | number |
| `utm_easting`              | number |
| `utm_northing`             | number |
| `latitude`                 | number |
| `longitude`                | number |
| `shape`                    | string |

## Example

```typescript
import type { BcgwRecreationResourceDto } from ''

// TODO: Update the object below with actual values
const example = {
  "forest_file_id": REC204117,
  "project_name": null,
  "project_type_code": SIT - Recreation site,
  "project_type": SIT,
  "project_established_date": null,
  "closure_ind": N,
  "closure_date": null,
  "closure_type": Wildfire,
  "closure_comment": null,
  "recreation_view_ind": null,
  "file_status_st": HI,
  "status_description": HI - Issued,
  "site_location": PEMBERTON,
  "defined_campsites": 0,
  "site_description_brief": null,
  "arch_impact_assess_ind": null,
  "tenure_app_total_area": null,
  "tenure_app_total_length": null,
  "site_description": null,
  "site_description_date": null,
  "driving_directions": null,
  "driving_directions_date": null,
  "rec_feature_code": B2,
  "rec_feature_description": B2 - Sand Beach,
  "recreation_district_code": RDPG,
  "recreation_district_name": Prince George-Mackenzie,
  "org_unit_code": DPG,
  "org_unit_name": null,
  "utm_zone": 10,
  "utm_easting": null,
  "utm_northing": null,
  "latitude": 55.3237,
  "longitude": -123.0935,
  "shape": {"type":"Point","coordinates":[-123.0935,55.3237]},
} satisfies BcgwRecreationResourceDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwRecreationResourceDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
