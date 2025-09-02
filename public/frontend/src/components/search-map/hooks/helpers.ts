import type Feature from 'ol/Feature';
import { locationDotOrangeIcon } from '@/components/search-map/styles/icons';
import { FeatureLayerConfig } from '@/components/search-map/hooks/types';
import OLMap from 'ol/Map';
import Point from 'ol/geom/Point';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import VectorLayer from 'ol/layer/Vector';
import { getSitePointFeatureFromRecResource } from '@/components/rec-resource/RecreationResourceMap/helpers';
import VectorSource from 'ol/source/Vector';
import { getCenter } from 'ol/extent';

export const isClusteredLayer = (layer: any): boolean =>
  !!layer.getSource?.()?.getSource?.();

export const applySelectedStyle = (
  feature: Feature,
  layerConfig: FeatureLayerConfig,
) => {
  if (layerConfig.selectedStyle) {
    const style =
      typeof layerConfig.selectedStyle === 'function'
        ? layerConfig.selectedStyle(feature)
        : layerConfig.selectedStyle;
    feature.setStyle(style);
  } else {
    feature.setStyle(locationDotOrangeIcon);
  }
};

export const getFeatureLayerConfig = (
  feature: Feature,
  featureLayers: FeatureLayerConfig[],
): FeatureLayerConfig | undefined => {
  return featureLayers.find(({ layer }) => {
    const clustered = isClusteredLayer(layer);
    const features = clustered
      ? layer.getSource()?.getFeatures()
      : layer.getSource().getFeatures();
    return features.includes(feature);
  });
};

export const getPointFeatureCoordinates = (feature: Feature) => {
  const geometry = feature.getGeometry();
  if (geometry instanceof Point) {
    return geometry.getCoordinates();
  }
};

export const centerMapOnFeature = (
  map: OLMap,
  feature: Feature,
  opts?: {
    featureOffsetX?: number;
    featureOffsetY?: number;
    duration?: number;
    maxZoom?: number;
  },
) => {
  const geometry = feature.getGeometry();
  if (!geometry) return;

  const extent = geometry.getExtent();

  const padding = [
    opts?.featureOffsetY ?? 0, // top
    0, // right
    0, // bottom
    opts?.featureOffsetX ?? 0, // left
  ];

  map.getView().fit(extent, {
    padding,
    duration: opts?.duration ?? 500,
    maxZoom: opts?.maxZoom ?? map.getView().getZoom(),
  });
};

export const focusRecResourceOnMap = (
  map: OLMap,
  recResource: RecreationResourceDetailModel,
  onFocusedFeatureChange: (feature: Feature | null) => void,
) => {
  const feature = getSitePointFeatureFromRecResource(recResource);
  if (!feature) return null;

  onFocusedFeatureChange(feature);

  feature.setId(recResource.rec_resource_id);
  feature.set('FOREST_FILE_ID', recResource.rec_resource_id);
  feature.set('selected', true);
  feature.setStyle(locationDotOrangeIcon);

  const featureLayer = new VectorLayer({
    source: new VectorSource({ features: [feature] }),
  });
  featureLayer.setZIndex(9999);

  map.addLayer(featureLayer);

  map.once('click', () => {
    map.removeLayer(featureLayer);
    onFocusedFeatureChange(null);
  });

  const focusExtent = feature.getGeometry()!.getExtent();
  const focusCenter = feature.getGeometry()
    ? getCenter(focusExtent)
    : undefined;

  return { focusCenter, featureLayer, focusExtent };
};
