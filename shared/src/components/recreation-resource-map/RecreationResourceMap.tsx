import { CSSProperties, useMemo } from 'react';
import { VectorFeatureMap } from '@bcgov/prp-map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@shared/components/recreation-resource-map/helpers';
import { StyleContext } from '@shared/components/recreation-resource-map/constants';

/**
 * Minimal interface for recreation resource data needed by the map component.
 * Uses flexible types to work with different model structures across apps.
 */
export interface RecreationResourceMapData {
  rec_resource_id: string;
  name: string;
  rec_resource_type: string;
  spatial_feature_geometry?: string[];
  site_point_geometry?: string;
  description?: string;
  maintenance_standard_code?: string;
  driving_directions?: string;
  recreation_access?:
    | string[]
    | Array<Partial<{ description: string; [key: string]: any }>>;
  recreation_resource_images?: Array<
    Partial<{
      recreation_resource_image_variants?: Array<
        Partial<{ url?: string; [key: string]: any }>
      >;
      [key: string]: any;
    }>
  >;
  recreation_activity?: Array<
    Partial<{
      description: string;
      recreation_activity_code: string | number;
      [key: string]: any;
    }>
  >;
  recreation_fee?: Array<
    Partial<{
      recreation_fee_code: string | number;
      fee_amount: number | string;
      fee_start_date: Date | null;
      fee_end_date: Date | null;
      monday_ind?: string;
      tuesday_ind?: string;
      wednesday_ind?: string;
      thursday_ind?: string;
      friday_ind?: string;
      saturday_ind?: string;
      sunday_ind?: string;
      [key: string]: any;
    }>
  >;
  [key: string]: any;
}

interface RecreationResourceMapProps<T extends RecreationResourceMapData> {
  recResource: T;
  mapComponentCssStyles?: CSSProperties;
}

// Constants for better maintainability
const LAYER_CONFIG = {
  ID: 'rec-resource-layer',
  VISIBLE: true,
} as const;

export const RecreationResourceMap = <T extends RecreationResourceMapData>({
  recResource,
  mapComponentCssStyles,
}: RecreationResourceMapProps<T>) => {
  const mapStyledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);

    if (!features?.length) {
      return [];
    }

    const layerStyle = getLayerStyleForRecResource(
      recResource,
      StyleContext.MAP_DISPLAY,
    );

    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  const layers = useMemo(() => {
    // if (!mapStyledFeatures.length) {
    //   return [];
    // }

    return [
      {
        id: LAYER_CONFIG.ID,
        layerInstance: new VectorLayer({
          source: new VectorSource({ features: mapStyledFeatures }),
          visible: LAYER_CONFIG.VISIBLE,
        }),
      },
    ];
  }, [mapStyledFeatures]);

  if (!mapStyledFeatures.length) {
    return null;
  }

  return (
    <VectorFeatureMap
      style={mapComponentCssStyles}
      layers={layers}
      enableTracking
      aria-label={`Map showing ${recResource.name || 'recreation resource'}`}
    />
  );
};

export default RecreationResourceMap;
