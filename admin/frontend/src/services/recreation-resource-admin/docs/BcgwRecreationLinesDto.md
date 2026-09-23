# BcgwRecreationLinesDto

## Properties

| Name                         | Type   |
| ---------------------------- | ------ |
| `amendment_id`               | number |
| `closest_community`          | string |
| `retirement_date`            | Date   |
| `resource_feature_ind`       | string |
| `arch_impact_assess_ind`     | string |
| `project_established_date`   | Date   |
| `display_on_public_site_ind` | string |
| `defined_campsites`          | number |
| `life_cycle_status_code`     | string |
| `rec_status_code`            | string |
| `rmf_skey`                   | number |
| `rec_resource_id`            | string |
| `section_id`                 | string |
| `rec_resource_type_code`     | string |
| `rec_resource_type`          | string |
| `map_label`                  | string |
| `rec_resource_name`          | string |
| `recreation_feature_code`    | string |
| `right_of_way`               | number |
| `recreation_district_code`   | string |
| `district_code`              | string |
| `district_name`              | string |
| `feature_length`             | number |
| `feature_length_m`           | number |

## Example

```typescript
import type { BcgwRecreationLinesDto } from ''

// TODO: Update the object below with actual values
const example = {
  "amendment_id": 1,
  "closest_community": KELOWNA,
  "retirement_date": null,
  "resource_feature_ind": null,
  "arch_impact_assess_ind": null,
  "project_established_date": null,
  "display_on_public_site_ind": null,
  "defined_campsites": 0,
  "life_cycle_status_code": ACTIVE,
  "rec_status_code": HI,
  "rmf_skey": 12345,
  "rec_resource_id": REC16098,
  "section_id": 1,
  "rec_resource_type_code": RTR,
  "rec_resource_type": Recreation Trail,
  "map_label": REC4531 15,
  "rec_resource_name": OKEOVER TRAILS,
  "recreation_feature_code": H3,
  "right_of_way": 10,
  "recreation_district_code": RDCO,
  "district_code": DCC,
  "district_name": DCC,
  "feature_length": 0.3338,
  "feature_length_m": 333.8,
} satisfies BcgwRecreationLinesDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BcgwRecreationLinesDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
