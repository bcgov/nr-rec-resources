# CreateRecreationAssetRepairDto

## Properties

| Name                           | Type   |
| ------------------------------ | ------ |
| `recreation_remed_repair_code` | string |
| `estimated_repair_cost`        | number |
| `actual_repair_cost`           | number |
| `repair_completed_date`        | string |
| `urgency`                      | string |
| `trail_segment_start`          | string |
| `trail_segment_end`            | string |
| `asset_id`                     | number |

## Example

```typescript
import type { CreateRecreationAssetRepairDto } from ''

// TODO: Update the object below with actual values
const example = {
  "recreation_remed_repair_code": RC,
  "estimated_repair_cost": 450,
  "actual_repair_cost": 485.5,
  "repair_completed_date": 2026-08-10,
  "urgency": High,
  "trail_segment_start": KM 0.5,
  "trail_segment_end": KM 1.2,
  "asset_id": 1,
} satisfies CreateRecreationAssetRepairDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateRecreationAssetRepairDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
