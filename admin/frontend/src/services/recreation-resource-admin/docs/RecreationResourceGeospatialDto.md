# RecreationResourceGeospatialDto

## Properties

| Name                       | Type                |
| -------------------------- | ------------------- |
| `rec_resource_id`          | string              |
| `spatial_feature_geometry` | Array&lt;string&gt; |
| `total_length_km`          | number              |
| `total_area_hectares`      | number              |
| `right_of_way_m`           | number              |
| `site_point_geometry`      | string              |
| `utm_zone`                 | number              |
| `utm_easting`              | number              |
| `utm_northing`             | number              |
| `latitude`                 | number              |
| `longitude`                | number              |

## Example

```typescript
import type { RecreationResourceGeospatialDto } from '';

// TODO: Update the object below with actual values
const example = {
  rec_resource_id: REC123,
  spatial_feature_geometry: [
    '{"type":"Polygon","coordinates":[[[1361161.693,527454.011],[1361142.12,527451.215]...]]}',
  ],
  total_length_km: 2.5,
  total_area_hectares: 12.35,
  right_of_way_m: 6,
  site_point_geometry: {
    type: 'Point',
    coordinates: [1292239.7691, 1133870.4011],
  },
  utm_zone: 10,
  utm_easting: 532726.45,
  utm_northing: 5935820.12,
  latitude: 53.5461,
  longitude: -127.6891,
} satisfies RecreationResourceGeospatialDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as RecreationResourceGeospatialDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints)
[[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
