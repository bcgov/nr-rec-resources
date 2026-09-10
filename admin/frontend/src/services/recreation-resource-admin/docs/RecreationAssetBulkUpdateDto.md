# RecreationAssetBulkUpdateDto

## Properties

| Name              | Type                                            |
| ----------------- | ----------------------------------------------- |
| `rec_resource_id` | string                                          |
| `asset_ids`       | Array&lt;number&gt;                             |
| `update_fields`   | [UpdateAssetFieldsDto](UpdateAssetFieldsDto.md) |

## Example

```typescript
import type { RecreationAssetBulkUpdateDto } from '';

// TODO: Update the object below with actual values
const example = {
  rec_resource_id: REC1222,
  asset_ids: [101, 102, 103],
  update_fields: { asset_name: 'Updated Asset Name', asset_area: 50 },
} satisfies RecreationAssetBulkUpdateDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecreationAssetBulkUpdateDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
