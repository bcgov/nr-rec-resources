import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/RecreationResourceMap';
import { GeoJSON } from 'ol/format';
import {
  MAP_PROJECTION_BC_ALBERS,
  MAP_PROJECTION_WEB_MERCATOR,
} from '@shared/components/recreation-resource-map/constants';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

/**
 * Retrieves the site point geometry ({@link Point}) feature for a recreation resource.
 * @param recResource - The recreation resource containing the site point geometry.
 * @returns The OpenLayers feature representing the site point geometry, or undefined if not found.
 */
export const getSitePointFeatureFromRecResource = (
  recResource: RecreationResourceMapData,
): Feature<Point> | undefined => {
  if (!recResource) {
    return;
  }

  // format that converts BC_ALBERS to WEB_MERCATOR
  const geojsonFormat = new GeoJSON({
    dataProjection: MAP_PROJECTION_BC_ALBERS,
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
  });

  const { site_point_geometry } = recResource;

  return geojsonFormat.readFeature(site_point_geometry) as Feature<Point>;
};

/**
 * Converts recreation resource geometries from BC Albers to Web Mercator projection
 * and returns them as OpenLayers features.
 *
 * @param recResource - The recreation resource containing geometry data
 * @returns An array of OpenLayers features converted to Web Mercator projection
 */
export const getMapFeaturesFromRecResource = (
  recResource?: RecreationResourceMapData,
) => {
  if (!recResource) {
    return [];
  }

  // format that converts BC_ALBERS to WEB_MERCATOR
  const geojsonFormat = new GeoJSON({
    dataProjection: MAP_PROJECTION_BC_ALBERS,
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
  });

  const { spatial_feature_geometry = [] } = recResource;

  const result = [
    ...spatial_feature_geometry.flatMap((geom) =>
      geojsonFormat.readFeatures(geom),
    ),
  ];

  const sitePointFeature = getSitePointFeatureFromRecResource(recResource);

  if (sitePointFeature) {
    result.push(sitePointFeature);
  }

  return result;
};
