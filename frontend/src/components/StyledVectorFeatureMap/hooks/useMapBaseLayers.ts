import { useEffect } from 'react';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { applyStyle } from 'ol-mapbox-style';
import { useGetMapStyles } from '@/components/StyledVectorFeatureMap/hooks';
import { MAP_URLS } from '@/components/StyledVectorFeatureMap/constants';

// Create base layers with vector tile source
const baseLayers = [
  new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: MAP_URLS.baseLayer,
    }),
  }),
];

/**
 * Hook that creates and manages vector tile base layers
 * @returns Array of base layers with applied styles
 */
export const useMapBaseLayers = () => {
  const { data: glStyles } = useGetMapStyles();

  // Apply mapbox styles to base layers when styles are loaded
  useEffect(() => {
    if (glStyles) {
      baseLayers.forEach((baseLayer) => {
        applyStyle(baseLayer, glStyles, 'esri');
      });
    }
  }, [glStyles]);

  return baseLayers;
};
