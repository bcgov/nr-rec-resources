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

const resetFeatureStyle = (feature: Feature) => {
  feature.set('selected', false);
  feature.setStyle();
  feature.changed();
};

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
  const selectionHandledRef = useRef<boolean>(false);

  const getLayerConfigById = (layerId: string) =>
    featureLayers.find((config) => config.id === layerId);

  // Clear current selection and reset styles
  const clearSelection = () => {
    const map = mapRef.current?.getMap();
    const current = selectedFeatureRef.current;
    if (!map || !current) return;

    resetFeatureStyle(current.feature);
    overlayRef.current?.setPosition(undefined);

    const layerConfig = getLayerConfigById(current.layerId);
    layerConfig?.onFeatureSelect(null);

    selectRef.current?.getFeatures().clear();
    selectedFeatureRef.current = null;
  };

  useEffect(() => {
    if (!mapRef?.current || !featureLayers.length) return;

    const map = mapRef.current.getMap();
    const layers = featureLayers.map((config) => config.layer).filter(Boolean);

    // Add select interaction for feature selection via click
    const select = new Select({
      condition: click,
      layers,
      style: null,
    });
    map.addInteraction(select);
    selectRef.current = select;

    const updateLayerZIndices = (selectedLayerId: string) => {
      featureLayers.forEach(({ id, layer }) => {
        layer.setZIndex(id === selectedLayerId ? 10 : 1);
      });
    };

    // Focus and select a feature, show popup and apply style
    const focusFeature = (
      feature: Feature,
      layerConfig: FeatureLayerConfig,
    ) => {
      clearSelection();

      applySelectedStyle(feature, layerConfig);
      feature.set('selected', true);
      map.renderSync();

      selectedFeatureRef.current = {
        feature,
        layerId: layerConfig.id,
      };

      centerMapOnFeature(map, feature, options);
      const centerCoords = getPointFeatureCoordinates(feature);
      map.once('rendercomplete', () => {
        overlayRef.current?.setPosition(centerCoords);
      });

      layerConfig.onFeatureSelect(feature);
      updateLayerZIndices(layerConfig.id);
    };

    const handleSelect = (e: SelectEvent) => {
      selectionHandledRef.current = true;

      // Deselect features and reset their styles
      e.deselected.forEach((feat) => {
        const layerConfig = getFeatureLayerConfig(feat, featureLayers);
        if (!layerConfig) return;

        const isClustered = isClusteredLayer(layerConfig.layer);
        const deselectedFeatures = isClustered
          ? feat.get('features') || []
          : [feat];

        deselectedFeatures.forEach(resetFeatureStyle);
        feat.setStyle();
        map.renderSync();
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

      const layerConfig = getLayerConfigById(current.layerId);
      if (!layerConfig) return clearSelection();

      const layer = layerConfig.layer;
      const view = map.getView();
      const zoom = view.getZoom() ?? 0;
      const hideBelowZoom = layer.get('hideBelowZoom') as number | undefined;

      // Clear selection if zoom is below threshold
      if (hideBelowZoom && zoom < hideBelowZoom) {
        return clearSelection();
      }

      const isClustered = isClusteredLayer(layer);
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

    // Clear selection when user clicks on empty map space
    const handleSingleClick = (evt: any) => {
      if (selectionHandledRef.current) {
        selectionHandledRef.current = false;
        return;
      }

      const hit = map.forEachFeatureAtPixel(evt.pixel, () => true, {
        layerFilter: (layer) => layers.includes(layer as any),
        hitTolerance: 2,
      });

      if (!hit) clearSelection();
    };

    select.on('select', handleSelect);
    map.on('moveend', handleMoveEnd);
    map.on('singleclick', handleSingleClick);

    return () => {
      map.removeInteraction(select);
      overlayRef.current = null;
      selectRef.current = null;
      map.un('moveend', handleMoveEnd);
      map.un('singleclick', handleSingleClick);
    };
    // eslint-disable-next-line
  }, [mapRef, featureLayers, overlayRef]);

  return {
    clearSelection,
  };
}
