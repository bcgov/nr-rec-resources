# SuggestionDto

## Properties

| Name                            | Type    |
| ------------------------------- | ------- |
| `name`                          | string  |
| `rec_resource_id`               | string  |
| `recreation_resource_type`      | string  |
| `recreation_resource_type_code` | string  |
| `district_description`          | string  |
| `closest_community`             | string  |
| `display_on_public_site`        | boolean |
| `rec_status_code`               | string  |

## Example

```typescript
import type { SuggestionDto } from ''

// TODO: Update the object below with actual values
const example = {
  "name": Tamihi Creek,
  "rec_resource_id": REC12345,
  "recreation_resource_type": RR,
  "recreation_resource_type_code": RR,
  "district_description": Chilliwack,
  "closest_community": Merrit,
  "display_on_public_site": true,
  "rec_status_code": AR,
} satisfies SuggestionDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SuggestionDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
