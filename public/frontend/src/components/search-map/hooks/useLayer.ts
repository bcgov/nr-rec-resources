import { useEffect, useMemo, useRef, useState } from 'react';
import VectorLayer from 'ol/layer/Vector';
import Feature, { FeatureLike } from 'ol/Feature';
import { UseLayerOptions, MapRef } from '@/components/search-map/hooks/types';

export type UseLayer = (
  mapRef: MapRef,
  options?: UseLayerOptions,
) => { layer: VectorLayer | null };

// hook to manage an OpenLayers vector layer with optional hover styles and zoom-based visibility
export function useLayer(
  mapRef: MapRef,
  createSource: () => any,
  createLayer: (source: any) => VectorLayer,
  createStyle: (feature: Feature, isHovered: boolean) => any,
  options: UseLayerOptions = {},
) {
  const { applyHoverStyles = false } = options;
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);

  const source = useMemo(() => createSource(), [createSource]);

  const layerRef = useRef<VectorLayer | null>(null);
  if (!layerRef.current) {
    layerRef.current = createLayer(source);
  }

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;

    const map = mapRef.current.getMap();

    const onPointerMove = (evt: any) => {
      if (!applyHoverStyles) return;
      const pixel = evt.pixel;
      const featureAtPixel = map.forEachFeatureAtPixel(
        pixel,
        (feat) => feat as Feature,
        {
          layerFilter: (candidateLayer) => candidateLayer === layerRef.current,
        },
      );
      const feature = featureAtPixel || null;

      if (feature !== hoveredFeature) {
        setHoveredFeature(feature);
      }
      map.getTargetElement().style.cursor = feature ? 'pointer' : '';
    };

    if (applyHoverStyles) {
      map.on('pointermove', onPointerMove);
    }

    return () => {
      if (applyHoverStyles) {
        map.un('pointermove', onPointerMove);
        map.getTargetElement().style.cursor = '';
      }
    };
  }, [mapRef, hoveredFeature, applyHoverStyles]);

  useEffect(() => {
    if (!applyHoverStyles || !layerRef.current) return;

    layerRef.current.setStyle((feature: FeatureLike, _resolution: number) =>
      createStyle(feature as Feature, feature === hoveredFeature),
    );

    layerRef.current.changed();
  }, [applyHoverStyles, createStyle, hoveredFeature]);

  return { layer: layerRef.current };
}
