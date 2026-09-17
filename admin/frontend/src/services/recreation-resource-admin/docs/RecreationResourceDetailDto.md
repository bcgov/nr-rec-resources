# RecreationResourceDetailDto

## Properties

| Name                             | Type                                                               |
| -------------------------------- | ------------------------------------------------------------------ |
| `rec_resource_id`                | string                                                             |
| `name`                           | string                                                             |
| `closest_community`              | string                                                             |
| `recreation_activity`            | [Array&lt;RecreationActivityDto&gt;](RecreationActivityDto.md)     |
| `recreation_status`              | [RecreationStatusDto](RecreationStatusDto.md)                      |
| `rec_resource_type`              | string                                                             |
| `rec_resource_type_code`         | object                                                             |
| `description`                    | string                                                             |
| `driving_directions`             | string                                                             |
| `maintenance_standard`           | string                                                             |
| `campsite_count`                 | number                                                             |
| `access_codes`                   | [Array&lt;RecreationAccessCodeDto&gt;](RecreationAccessCodeDto.md) |
| `recreation_structure`           | [RecreationStructureDto](RecreationStructureDto.md)                |
| `spatial_feature_geometry`       | Array&lt;string&gt;                                                |
| `site_point_geometry`            | string                                                             |
| `recreation_district`            | [RecreationResourceDistrictDto](RecreationResourceDistrictDto.md)  |
| `project_established_date`       | Date                                                               |
| `last_rec_inspection_date`       | Date                                                               |
| `last_hzrd_tree_assess_date`     | Date                                                               |
| `recreation_control_access_code` | [RecreationControlAccessDto](RecreationControlAccessDto.md)        |
| `risk_rating`                    | [RecreationRiskRatingDto](RecreationRiskRatingDto.md)              |
| `display_on_public_site`         | boolean                                                            |
| `right_of_way`                   | number                                                             |
| `rec_status_code`                | string                                                             |
| `rec_status_description`         | string                                                             |
| `natural_resource_org_unit_name` | string                                                             |

## Example

```typescript
import type { RecreationResourceDetailDto } from ''

// TODO: Update the object below with actual values
const example = {
  "rec_resource_id": null,
  "name": Evergreen Valley Campground,
  "closest_community": 123 Forest Road, Mountain View, CA 94043,
  "recreation_activity": null,
  "recreation_status": null,
  "rec_resource_type": IF,
  "rec_resource_type_code": SIT,
  "description": A scenic campground nestled in the heart of Evergreen Valley,
  "driving_directions": Take exit 123 off the highway and follow the signs,
  "maintenance_standard": U,
  "campsite_count": 15,
  "access_codes": null,
  "recreation_structure": null,
  "spatial_feature_geometry": ["{\"type\":\"MultiPolygon\",\"coordinates\":[[[[1361161.693,527454.011],[1361142.12,527451.215],[1361124.878,527449.351],[1361107.636,527447.021],[1361091.326,527449.351],[1361073.152,527452.613], ...]]]}"],
  "site_point_geometry": ["{\"type\":\"Point\",\"coordinates\":[1292239.7691,1133870.4011]}"],
  "recreation_district": null,
  "project_established_date": null,
  "last_rec_inspection_date": null,
  "last_hzrd_tree_assess_date": null,
  "recreation_control_access_code": G,
  "risk_rating": null,
  "display_on_public_site": true,
  "right_of_way": 6,
  "rec_status_code": OPN,
  "rec_status_description": Issued,
  "natural_resource_org_unit_name": Selkirk Natural Resource District,
} satisfies RecreationResourceDetailDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationResourceDetailDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
