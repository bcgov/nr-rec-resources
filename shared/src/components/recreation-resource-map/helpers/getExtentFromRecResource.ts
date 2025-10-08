import { GeoJSON } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/RecreationResourceMap';
export const getExtentFromRecResource = (
  recResource?: RecreationResourceMapData,
) => {
  if (!recResource) return;

  const geojson = new GeoJSON();
  const features = [
    ...(recResource.spatial_feature_geometry ?? []),
    ...(recResource.site_point_geometry
      ? [recResource.site_point_geometry]
      : []),
  ].flatMap((geom) => geojson.readFeatures(geom));

  if (!features.length) return;

  const source = new VectorSource({ features });
  return source.getExtent();
};
