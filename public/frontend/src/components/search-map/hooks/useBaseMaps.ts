import { useMemo } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import { useStyledLayer } from '@bcgov/prp-map';
import {
  BC_BASE_LAYER_URLS,
  CANADA_TOPO_LAYER_URLS,
  BASE_LAYER_URLS,
  WORLD_BASEMAP_V2_URLS,
} from '@/components/search-map/constants';

export const useBaseMaps = () => {
  const prpBaseLayer = useStyledLayer(
    BC_BASE_LAYER_URLS.VECTOR_TILE_URL,
    BC_BASE_LAYER_URLS.STYLE_URL,
    'esri',
  );
  const canadaTopographicLayerBasic = useStyledLayer(
    CANADA_TOPO_LAYER_URLS.VECTOR_TILE_URL,
    CANADA_TOPO_LAYER_URLS.STYLE_URL_BASIC,
    'esri',
  );

  const worldBasemapV2Layer = useStyledLayer(
    WORLD_BASEMAP_V2_URLS.VECTOR_TILE_URL,
    WORLD_BASEMAP_V2_URLS.STYLE_URL,
    'esri',
  );

  worldBasemapV2Layer.setOpacity(0.3);

  const baseMaps = useMemo(
    () => [
      {
        id: 'prp',
        name: 'BC Basemap',
        layer: prpBaseLayer,
        image: '/src/components/search-map/assets/basemap/bc_basemap.webp',
      },
      {
        id: 'hillshade',
        name: 'Hillshade',
        layer: new LayerGroup({
          layers: [
            new TileLayer({
              source: new XYZ({
                url: BASE_LAYER_URLS.CANADA_HILLSHADE_TILE_LAYER,
                attributions: 'Esri Canada Hillshade',
                cacheSize: 1024,
              }),
              preload: 4,
              useInterimTilesOnError: true,
            }),

            worldBasemapV2Layer,
            canadaTopographicLayerBasic,
          ] as BaseLayer[],
        }),
        image: '/src/components/search-map/assets/basemap/hillshade.webp',
      },

      {
        id: 'satellite',
        name: 'Satellite',
        layer: new LayerGroup({
          layers: [
            new TileLayer({
              source: new XYZ({
                url: BASE_LAYER_URLS.ESRI_WORLD_IMAGERY_LAYER,
                attributions: 'Esri World Imagery',
                cacheSize: 512,
                maxZoom: 18, // Esri World Imagery maximum zoom level
              }),
              preload: 4,
              useInterimTilesOnError: true,
            }),
            canadaTopographicLayerBasic,
          ] as BaseLayer[],
        }),
        image: '/src/components/search-map/assets/basemap/satellite.webp',
      },
    ],
    [prpBaseLayer, canadaTopographicLayerBasic, worldBasemapV2Layer],
  );

  return baseMaps;
};
