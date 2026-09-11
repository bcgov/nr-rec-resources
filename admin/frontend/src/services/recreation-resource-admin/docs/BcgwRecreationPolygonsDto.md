# BcgwRecreationPolygonsDto

## Properties

| Name                          | Type   |
| ----------------------------- | ------ |
| `amendment_id`                | number |
| `site_location`               | string |
| `retirement_date`             | Date   |
| `resource_feature_ind`        | string |
| `arch_impact_assess_ind`      | string |
| `project_established_date`    | Date   |
| `recreation_view_ind`         | string |
| `defined_campsites`           | number |
| `life_cycle_status_code`      | string |
| `file_status_code`            | string |
| `rmf_skey`                    | number |
| `forest_file_id`              | string |
| `section_id`                  | string |
| `recreation_map_feature_code` | string |
| `project_type`                | string |
| `map_label`                   | string |
| `project_name`                | string |
| `recreation_feature_code`     | string |
| `recreation_district_code`    | string |
| `geographic_district_code`    | string |
| `geographic_district_name`    | string |
| `feature_area`                | number |
| `feature_perimeter`           | number |
| `feature_area_sqm`            | string |
| `feature_length_m`            | number |

## Example

```typescript
import type { BcgwRecreationPolygonsDto } from ''

// TODO: Update the object below with actual values
const example = {
  "amendment_id": 1,
  "site_location": KELOWNA,
  "retirement_date": null,
  "resource_feature_ind": null,
  "arch_impact_assess_ind": null,
  "project_established_date": null,
  "recreation_view_ind": null,
  "defined_campsites": 0,
  "life_cycle_status_code": ACTIVE,
  "file_status_code": HI,
  "rmf_skey": 23456,
  "forest_file_id": REC230971,
  "section_id": null,
  "recreation_map_feature_code": SIT,
  "project_type": Recreation Site,
  "map_label": REC230971,
  "project_name": KASLO INTERPRETIVE FOREST,
  "recreation_feature_code": E5,
  "recreation_district_code": RDCC,
  "geographic_district_code": DCC,
  "geographic_district_name": Chilliwack Natural Resource District,
  "feature_area": 2.9634,
  "feature_perimeter": 1.0079,
  "feature_area_sqm": 29634.357175518,
  "feature_length_m": 1007.9,
} satisfies BcgwRecreationPolygonsDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwRecreationPolygonsDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
