import { RecreationResourceDetailModel } from '@/service/custom-models';
import { GeoJSON } from 'ol/format';
import {
  MAP_PROJECTION_BC_ALBERS,
  MAP_PROJECTION_WEB_MERCATOR,
} from '@/components/rec-resource/RecreationResourceMap/constants';

/**
 * Converts recreation resource geometries from BC Albers to Web Mercator projection
 * and returns them as OpenLayers features.
 *
 * @param recResource - The recreation resource containing geometry data
 * @returns An array of OpenLayers features converted to Web Mercator projection
 */
export const getMapFeaturesFromRecResource = (
  recResource?: RecreationResourceDetailModel,
) => {
  if (!recResource) {
    return [];
  }

  // format that converts BC_ALBERS to WEB_MERCATOR
  const geojsonFormat = new GeoJSON({
    dataProjection: MAP_PROJECTION_BC_ALBERS,
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
  });

  const { site_point_geometry, spatial_feature_geometry = [] } = recResource;

  return [
    ...spatial_feature_geometry.flatMap((geom) =>
      geojsonFormat.readFeatures(geom),
    ),
    ...(site_point_geometry
      ? geojsonFormat.readFeatures(site_point_geometry)
      : []),
  ];
};
