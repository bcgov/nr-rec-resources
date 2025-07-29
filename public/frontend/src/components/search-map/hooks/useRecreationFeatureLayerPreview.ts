import { useEffect, useRef } from 'react';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { click } from 'ol/events/condition';
import { locationDotOrangeIcon } from '@/components/search-map/styles/icons';
import Point from 'ol/geom/Point';
import type OLMap from 'ol/Map';
import type Feature from 'ol/Feature';
import type { SelectEvent } from 'ol/interaction/Select';

interface UseRecreationFeatureLayerPreviewParams {
  mapRef: React.RefObject<{ getMap: () => OLMap } | null>;
  layer: any;
  onFeatureSelect: (feature: Feature | null) => void;
}

// Hook that returns a ref to that must be attached to an HTML container element
// which will be used to display a popup with feature details when a feature is selected on the map.
export function useRecreationFeatureLayerPreview({
  mapRef,
  layer,
  onFeatureSelect,
}: UseRecreationFeatureLayerPreviewParams) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const selectedFeatureRef = useRef<Feature | null>(null);

  useEffect(() => {
    if (!mapRef?.current || !layer || !popupRef.current) return;

    const map = mapRef.current.getMap();

    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      offset: [0, -32],
      stopEvent: true,
    });
    map.addOverlay(overlay);
    overlayRef.current = overlay;

    const select = new Select({
      condition: click,
      layers: [layer],
      style: null,
    });
    map.addInteraction(select);

    const clearSelection = () => {
      selectedFeatureRef.current?.set('selected', false);
      selectedFeatureRef.current?.setStyle();
      overlay.setPosition(undefined);
      selectedFeatureRef.current = null;
      onFeatureSelect(null);
    };

    const focusFeature = (feature: Feature, clusterFeature: Feature) => {
      clusterFeature.setStyle(locationDotOrangeIcon);
      feature.set('selected', true);
      selectedFeatureRef.current = feature;

      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        const coordinate = geometry.getCoordinates();
        overlay.setPosition(coordinate);

        requestAnimationFrame(() => {
          map.getView().animate({ center: coordinate, duration: 400 });
        });
      }

      onFeatureSelect(feature);
    };

    const handleSelect = (e: SelectEvent) => {
      e.deselected.forEach((clusterFeature) => {
        (clusterFeature.get('features') || []).forEach((f: Feature) => {
          f.set('selected', false);
          f.setStyle();
        });
        clusterFeature.setStyle();
      });

      const selected = e.selected[0];
      if (!selected) return clearSelection();

      const features = selected.get('features') ?? [];
      if (features.length === 1) {
        focusFeature(features[0], selected);
      } else {
        select.getFeatures().clear();
        clearSelection();
      }
    };

    const handleMoveEnd = () => {
      const feature = selectedFeatureRef.current;
      if (!feature) return;

      const cluster = layer
        .getSource()
        .getFeatures()
        .find((f: Feature) => (f.get('features') || []).includes(feature));

      if (!cluster || (cluster.get('features')?.length ?? 0) > 1) {
        clearSelection();
      }
    };

    const checkSingleFeature = () => {
      const clusters = layer.getSource().getFeatures();
      if (clusters.length !== 1) return;

      const clusterFeature = clusters[0];
      const features = clusterFeature.get('features') ?? [];
      if (features.length === 1) {
        focusFeature(features[0], clusterFeature);
        select.getFeatures().push(clusterFeature);
      }
    };

    select.on('select', handleSelect);
    map.on('moveend', handleMoveEnd);

    const vectorSource = layer.getSource()?.getSource?.();
    let debounce: NodeJS.Timeout;

    const onFeatureAdd = () => {
      clearTimeout(debounce);
      debounce = setTimeout(checkSingleFeature, 50);
    };

    if (vectorSource) {
      vectorSource.on('addfeature', onFeatureAdd);
      checkSingleFeature();
    }

    return () => {
      map.removeInteraction(select);
      map.removeOverlay(overlay);
      overlayRef.current = null;

      if (vectorSource) {
        vectorSource.un('addfeature', onFeatureAdd);
        clearTimeout(debounce);
      }
    };
  }, [layer, mapRef, onFeatureSelect]);

  return popupRef;
}
