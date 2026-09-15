# RepairChange

## Properties

| Name                    | Type                |
| ----------------------- | ------------------- |
| `estimated_repair_cost` | number              |
| `actual_repair_cost`    | number              |
| `station_start`         | string              |
| `station_end`           | string              |
| `asset_ids`             | Array&lt;number&gt; |

## Example

```typescript
import type { RepairChange } from ''

// TODO: Update the object below with actual values
const example = {
  "estimated_repair_cost": 1000,
  "actual_repair_cost": 950,
  "station_start": 49.232423, -128.334343,
  "station_end": 49.234561, -128.331872,
  "asset_ids": [1,2,3],
} satisfies RepairChange

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RepairChange
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
