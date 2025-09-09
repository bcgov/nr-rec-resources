import { RefObject, useEffect, useRef } from 'react';
import type { SelectEvent } from 'ol/interaction/Select';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { click } from 'ol/events/condition';
import type Feature from 'ol/Feature';
import {
  FeatureLayerConfig,
  SelectedFeatureInfo,
} from '@/components/search-map/hooks/types';
import {
  applySelectedStyle,
  centerMapOnFeature,
  getFeatureLayerConfig,
  getPointFeatureCoordinates,
  isClusteredLayer,
} from '@/components/search-map/hooks/helpers';
import OLMap from 'ol/Map';

interface UseFeatureSelectionParams {
  mapRef: RefObject<{ getMap: () => OLMap } | null>;
  featureLayers: FeatureLayerConfig[];
  overlayRef: RefObject<Overlay | null>;
  options?: {
    featureOffsetX?: number;
    featureOffsetY?: number;
  };
}

/**
 * Custom hook to manage feature selection in an OpenLayers map for multiple layers which is
 * needed as the map can have multiple feature layers, each with its own selection logic.
 * This will ensure that only one feature can be selected at a time across all layers.
 * It handles selecting features, applying styles, and displaying a popup.
 */
export function useFeatureSelection({
  mapRef,
  featureLayers,
  overlayRef,
  options = {},
}: UseFeatureSelectionParams) {
  const selectedFeatureRef = useRef<SelectedFeatureInfo | null>(null);
  const selectRef = useRef<Select | null>(null);

  // Clear current selection and reset styles
  const clearSelection = () => {
    const map = mapRef.current?.getMap();
    const current = selectedFeatureRef.current;
    if (!map || !current) return;

    current.feature.set('selected', false);
    current.feature.setStyle();

    overlayRef.current?.setPosition(undefined);

    const layerConfig = featureLayers.find(
      (config) => config.id === current.layerId,
    );
    if (layerConfig) {
      layerConfig.onFeatureSelect(null);
    }

    selectRef.current?.getFeatures().clear();

    selectedFeatureRef.current = null;
  };

  useEffect(() => {
    if (!mapRef?.current || !featureLayers.length) return;

    const map = mapRef.current.getMap();
    // Extract valid layers from featureLayers config
    const layers = featureLayers.map((config) => config.layer).filter(Boolean);

    // Add select interaction for feature selection via click
    const select = new Select({
      condition: click,
      layers,
      style: null,
    });
    map.addInteraction(select);
    selectRef.current = select;

    // Focus and select a feature, show popup and apply style
    const focusFeature = (
      feature: Feature,
      layerConfig: FeatureLayerConfig,
    ) => {
      clearSelection();

      applySelectedStyle(feature, layerConfig);
      feature.set('selected', true);

      selectedFeatureRef.current = {
        feature,
        layerId: layerConfig.id,
      };

      // center map on feature for popup
      centerMapOnFeature(map, feature, options);
      const centerCoords = getPointFeatureCoordinates(feature);
      overlayRef.current?.setPosition(centerCoords);

      layerConfig.onFeatureSelect(feature);

      // Update z-index of all feature layers based on selection
      featureLayers.forEach(({ id, layer }) => {
        const isSelected = selectedFeatureRef.current?.layerId === id;
        layer.setZIndex(isSelected ? 10 : 1);
      });
    };

    const handleSelect = (e: SelectEvent) => {
      // Deselect features and reset their styles
      e.deselected.forEach((feat) => {
        const layerConfig = getFeatureLayerConfig(feat, featureLayers);

        if (layerConfig) {
          const isClustered = isClusteredLayer(layerConfig.layer);
          const deselectedFeatures = isClustered
            ? feat.get('features') || []
            : [feat];

          deselectedFeatures.forEach((f: Feature) => {
            f.set('selected', false);
            f.setStyle();
          });

          feat.setStyle();
        }
      });

      // Select the clicked feature
      const selected = e.selected[0];
      if (!selected) return clearSelection();

      const layerConfig = featureLayers.find((config) => {
        const isClustered = isClusteredLayer(config.layer);
        const features = isClustered
          ? config.layer.getSource()?.getFeatures()
          : config.layer.getSource().getFeatures();
        return features.includes(selected);
      });

      if (!layerConfig) return clearSelection();

      const isClustered = isClusteredLayer(layerConfig.layer);
      if (isClustered) {
        const features = selected.get('features') ?? [];
        if (features.length === 1) {
          focusFeature(features[0], layerConfig);
        } else {
          // If cluster contains multiple features, clear selection
          select.getFeatures().clear();
          clearSelection();
        }
      } else {
        focusFeature(selected, layerConfig);
      }
    };

    const handleMoveEnd = () => {
      const current = selectedFeatureRef.current;
      const map = mapRef.current?.getMap();
      if (!current || !map) return;

      const view = map.getView();
      const zoom = view.getZoom() ?? 0;

      const layerConfig = featureLayers.find(
        (config) => config.id === current.layerId,
      );
      if (!layerConfig) return;

      const layer = layerConfig.layer;
      const hideBelowZoom = layer.get('hideBelowZoom') as number | undefined;
      const isClustered = isClusteredLayer(layer);

      // Clear selection if zoom is below threshold
      if (hideBelowZoom && zoom < hideBelowZoom) {
        return clearSelection();
      }

      const source = isClustered
        ? layer.getSource()?.getSource?.()
        : layer.getSource?.();

      const features = source?.getFeatures?.() ?? [];
      const isFeaturePresent = features.includes(current.feature);

      if (!isFeaturePresent) {
        return clearSelection();
      }

      // For clustered layers, check if feature is still in a single cluster and clear if not
      if (isClustered) {
        const clusterFeature = layer
          .getSource()
          .getFeatures()
          .find((f: Feature) =>
            (f.get('features') ?? []).includes(current.feature),
          );

        const clusteredItems = clusterFeature?.get('features') ?? [];

        if (!clusterFeature || clusteredItems.length !== 1) {
          return clearSelection();
        }
      }
    };

    select.on('select', handleSelect);
    map.on('moveend', handleMoveEnd);

    return () => {
      map.removeInteraction(select);
      overlayRef.current = null;
      selectRef.current = null;
    };
    // eslint-disable-next-line
  }, [mapRef, featureLayers, overlayRef]);

  return {
    clearSelection,
  };
}
