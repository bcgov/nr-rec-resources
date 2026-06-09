import { useEffect, useMemo, useState } from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature, { FeatureLike } from 'ol/Feature';
import { UseLayerOptions, MapRef } from '@/components/search-map/hooks/types';

export type UseLayer = (
  mapRef: MapRef,
  options?: UseLayerOptions,
) => { layer: VectorLayer | null };

// hook to manage an OpenLayers vector layer with optional hover styles and zoom-based visibility
export function useLayer(
  mapRef: MapRef,
  createSource: () => VectorSource,
  createLayer: (source: VectorSource) => VectorLayer,
  createStyle: (feature: Feature, isHovered: boolean) => any,
  options: UseLayerOptions = {},
) {
  const { hideBelowZoom, applyHoverStyles = false } = options;
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);

  // Source is recreated whenever the caller's createSource reference changes,
  // letting consumers swap in a fresh source (e.g. after a search) by passing
  // a memoized factory keyed.
  const source = useMemo(() => createSource(), [createSource]);

  const layer = useMemo(() => {
    const l = createLayer(source);
    if (hideBelowZoom) {
      l.set('hideBelowZoom', hideBelowZoom);
      l.setVisible(false);
    }
    return l;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (layer.getSource() !== source) {
      layer.setSource(source);
    }
  }, [source, layer]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    const updateVisibility = () => {
      if (!hideBelowZoom) return;
      const zoom = map.getView().getZoom() ?? 0;
      layer.setVisible(zoom >= hideBelowZoom);
    };

    const onPointerMove = (evt: any) => {
      if (!applyHoverStyles) return;
      const pixel = evt.pixel;
      const featureAtPixel = map.forEachFeatureAtPixel(
        pixel,
        (feat) => feat as Feature,
        {
          layerFilter: (candidateLayer) => candidateLayer === layer,
        },
      );
      const feature = featureAtPixel || null;

      if (feature !== hoveredFeature) {
        setHoveredFeature(feature);
      }
      map.getTargetElement().style.cursor = feature ? 'pointer' : '';
    };

    if (hideBelowZoom) {
      map.on('moveend', updateVisibility);
      updateVisibility();
    }

    if (applyHoverStyles) {
      map.on('pointermove', onPointerMove);
    }

    return () => {
      if (hideBelowZoom) {
        map.un('moveend', updateVisibility);
      }
      if (applyHoverStyles) {
        map.un('pointermove', onPointerMove);
        map.getTargetElement().style.cursor = '';
      }
    };
  }, [mapRef, hoveredFeature, hideBelowZoom, applyHoverStyles, layer]);

  useEffect(() => {
    if (!applyHoverStyles) return;

    layer.setStyle((feature: FeatureLike, _resolution: number) =>
      createStyle(feature as Feature, feature === hoveredFeature),
    );

    layer.changed();
  }, [applyHoverStyles, createStyle, hoveredFeature, layer]);

  return { layer, source };
}
