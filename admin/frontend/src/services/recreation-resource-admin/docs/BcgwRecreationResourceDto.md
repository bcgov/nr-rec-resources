# BcgwRecreationResourceDto

## Properties

| Name                             | Type   |
| -------------------------------- | ------ |
| `rec_resource_id`                | string |
| `rec_resource_name`              | string |
| `rec_resource_type_code`         | string |
| `rec_resource_type`              | string |
| `project_established_date`       | Date   |
| `closure_ind`                    | string |
| `closure_date`                   | Date   |
| `closure_type`                   | string |
| `closure_comment`                | string |
| `display_on_public_site_ind`     | string |
| `rec_status_code`                | string |
| `rec_status_description`         | string |
| `closest_community`              | string |
| `defined_campsites`              | number |
| `description`                    | string |
| `arch_impact_assess_ind`         | string |
| `total_feature_area`             | number |
| `total_feature_length`           | number |
| `site_description`               | string |
| `site_description_date`          | Date   |
| `driving_directions`             | string |
| `driving_directions_date`        | Date   |
| `recreation_feature_code`        | string |
| `recreation_feature_description` | string |
| `recreation_district_code`       | string |
| `recreation_district_name`       | string |
| `org_unit_code`                  | string |
| `org_unit_name`                  | string |
| `utm_zone`                       | number |
| `utm_easting`                    | number |
| `utm_northing`                   | number |
| `latitude`                       | number |
| `longitude`                      | number |
| `shape`                          | string |

## Example

```typescript
import type { BcgwRecreationResourceDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": REC204117,
  "rec_resource_name": null,
  "rec_resource_type_code": SIT - Recreation site,
  "rec_resource_type": SIT,
  "project_established_date": null,
  "closure_ind": N,
  "closure_date": null,
  "closure_type": Wildfire,
  "closure_comment": null,
  "display_on_public_site_ind": null,
  "rec_status_code": HI,
  "rec_status_description": HI - Issued,
  "closest_community": PEMBERTON,
  "defined_campsites": 0,
  "description": null,
  "arch_impact_assess_ind": null,
  "total_feature_area": null,
  "total_feature_length": null,
  "site_description": null,
  "site_description_date": null,
  "driving_directions": null,
  "driving_directions_date": null,
  "recreation_feature_code": B2,
  "recreation_feature_description": B2 - Sand Beach,
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
