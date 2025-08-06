import { useEffect, useRef } from 'react';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { click } from 'ol/events/condition';
import Point from 'ol/geom/Point';
import type OLMap from 'ol/Map';
import type Feature from 'ol/Feature';
import type { SelectEvent } from 'ol/interaction/Select';
import type Style from 'ol/style/Style';
import { locationDotOrangeIcon } from '@/components/search-map/styles/icons';

interface FeatureLayerConfig {
  id: string;
  layer: any;
  onFeatureSelect: (feature: Feature | null) => void;
  selectedStyle?: Style | ((feature: Feature) => Style);
}

interface UseFeatureSelectionParams {
  mapRef: React.RefObject<{ getMap: () => OLMap } | null>;
  featureLayers: FeatureLayerConfig[];
  popupRef: React.RefObject<HTMLDivElement | null>;
  options?: {
    featureOffsetX?: number;
    featureOffsetY?: number;
  };
}

interface SelectedFeatureInfo {
  feature: Feature;
  layerId: string;
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
  popupRef,
  options = {},
}: UseFeatureSelectionParams) {
  const overlayRef = useRef<Overlay | null>(null);
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
    if (!mapRef?.current || !featureLayers.length || !popupRef.current) return;

    const map = mapRef.current.getMap();
    // Extract valid layers from featureLayers config
    const layers = featureLayers.map((config) => config.layer).filter(Boolean);

    // Create and add overlay for popup display
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      offset: [0, -32],
      stopEvent: true,
    });
    map.addOverlay(overlay);
    overlayRef.current = overlay;

    // Add select interaction for feature selection via click
    const select = new Select({
      condition: click,
      layers,
      style: null,
    });
    map.addInteraction(select);
    selectRef.current = select;

    const applySelectedStyle = (
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

    const isClusteredLayer = (layer: any): boolean => {
      return !!layer.getSource?.()?.getSource?.();
    };

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

      if (overlayRef.current) {
        const geometry = feature.getGeometry();
        if (geometry instanceof Point) {
          const coordinate = geometry.getCoordinates();
          const offsetY = options.featureOffsetY || 0;
          const offsetX = options.featureOffsetX || 0;

          const pixel = map.getPixelFromCoordinate(coordinate);
          const offsetCoord = map.getCoordinateFromPixel([
            pixel[0] + offsetX, // increase X to push map center right
            pixel[1] + offsetY, // increase Y to push map center down
          ]);

          overlayRef.current.setPosition(coordinate);
          map.renderSync();
          map.getView().animate({ center: offsetCoord, duration: 400 });
        }
      }

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
        const layerConfig = featureLayers.find((config) => {
          const isClustered = isClusteredLayer(config.layer);
          const features = isClustered
            ? config.layer.getSource()?.getFeatures()
            : config.layer.getSource().getFeatures();
          return features.includes(feat);
        });

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
      map.removeOverlay(overlay);
      overlayRef.current = null;
      selectRef.current = null;
    };
    // eslint-disable-next-line
  }, [mapRef, featureLayers, popupRef]);

  return {
    clearSelection,
  };
}
