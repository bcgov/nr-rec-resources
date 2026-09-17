# RecreationAssetDto

## Properties

| Name                      | Type                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `parent_id`               | number                                                               |
| `asset_tag`               | string                                                               |
| `rec_resource_id`         | string                                                               |
| `asset_code`              | number                                                               |
| `asset_name`              | string                                                               |
| `asset_comment`           | string                                                               |
| `legacy_structure_id`     | string                                                               |
| `asset_length`            | number                                                               |
| `asset_width`             | number                                                               |
| `asset_area`              | number                                                               |
| `actual_value`            | number                                                               |
| `installation_date`       | string                                                               |
| `geometry_type_code`      | object                                                               |
| `latitude`                | object                                                               |
| `longitude`               | object                                                               |
| `asset_id`                | number                                                               |
| `updated_by`              | string                                                               |
| `updated_at`              | string                                                               |
| `recreation_asset_repair` | [Array&lt;RecreationAssetRepairDto&gt;](RecreationAssetRepairDto.md) |

## Example

```typescript
import type { RecreationAssetDto } from ''

// TODO: Update the object below with actual values
const example = {
  "parent_id": 100,
  "asset_tag": CS-012,
  "rec_resource_id": REC1222,
  "asset_code": 1,
  "asset_name": Campsite #12 Table,
  "asset_comment": Located near river,
  "legacy_structure_id": LEG-884,
  "asset_length": 12.5,
  "asset_width": 3,
  "asset_area": 37.5,
  "actual_value": 1800.5,
  "installation_date": 2023-05-15,
  "geometry_type_code": PT,
  "latitude": 49.94212,
  "longitude": -123.03604,
  "asset_id": 101,
  "updated_by": null,
  "updated_at": null,
  "recreation_asset_repair": null,
} satisfies RecreationAssetDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationAssetDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
