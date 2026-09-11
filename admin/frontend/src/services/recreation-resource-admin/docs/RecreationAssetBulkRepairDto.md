# RecreationAssetBulkRepairDto

## Properties

| Name                           | Type                                         |
| ------------------------------ | -------------------------------------------- |
| `recreation_remed_repair_code` | string                                       |
| `completed_date`               | string                                       |
| `changes`                      | [Array&lt;RepairChange&gt;](RepairChange.md) |

## Example

```typescript
import type { RecreationAssetBulkRepairDto } from ''

// TODO: Update the object below with actual values
const example = {
  "recreation_remed_repair_code": CL,
  "completed_date": 2023-10-01,
  "changes": [{"estimated_repair_cost":1000,"actual_repair_cost":950,"asset_ids":[1,2,3]}],
} satisfies RecreationAssetBulkRepairDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationAssetBulkRepairDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
