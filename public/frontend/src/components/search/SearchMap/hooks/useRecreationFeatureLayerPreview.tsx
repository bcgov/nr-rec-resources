import { useEffect, useRef } from 'react';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { click } from 'ol/events/condition';
import { locationDotOrangeIcon } from '@/components/search/SearchMap/styles/icons';
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
      const feature = selectedFeatureRef.current;
      if (feature) {
        feature.set('selected', false);
        feature.setStyle(undefined);
      }
      overlay.setPosition(undefined);
      selectedFeatureRef.current = null;
      onFeatureSelect(null);
    };

    const handleSelect = (e: SelectEvent) => {
      e.deselected.forEach((clusterFeature) => {
        (clusterFeature.get('features') || []).forEach((feature: Feature) => {
          feature.set('selected', false);
          feature.setStyle(undefined);
        });
        clusterFeature.setStyle(undefined);
      });

      const selected = e.selected[0];

      if (selected) {
        const features = selected.get('features') ?? [];
        if (features.length === 1) {
          const feature = features[0];
          selected.setStyle(locationDotOrangeIcon);
          feature.set('selected', true);
          selectedFeatureRef.current = feature;

          const coordinate = feature.getGeometry()?.getCoordinates();
          overlayRef.current?.setPosition(coordinate);
          onFeatureSelect(feature);

          if (coordinate) {
            requestAnimationFrame(() => {
              mapRef.current?.getMap().getView().animate({
                center: coordinate,
                duration: 400,
              });
            });
          }
        } else {
          select.getFeatures().clear();
          clearSelection();
        }
      } else {
        clearSelection();
      }
    };

    const handleMoveEnd = () => {
      // If the selected feature is now part of a cluster, hide the popup
      const feature = selectedFeatureRef.current;
      if (!feature) return;

      const clusteredFeature = layer
        .getSource()
        .getFeatures()
        .find((f: Feature) => (f.get('features') || []).includes(feature));

      const clusterSize = clusteredFeature?.get('features')?.length ?? 0;

      if (!clusteredFeature || clusterSize > 1) {
        clearSelection();
      }
    };

    select.on('select', handleSelect);
    map.on('moveend', handleMoveEnd);

    return () => {
      map.removeInteraction(select);
      map.removeOverlay(overlay);
      overlayRef.current = null;
    };
  }, [layer, mapRef, onFeatureSelect]);

  return popupRef;
}
