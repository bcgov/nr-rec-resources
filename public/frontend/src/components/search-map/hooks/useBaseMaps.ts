import { useMemo } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import { useStyledLayer } from '@bcgov/prp-map';
import { MAP_LAYER_URLS } from '@/components/search-map/constants';

export const useBaseMaps = () => {
  const prpBaseLayer = useStyledLayer(
    MAP_LAYER_URLS.BC_BASE_LAYER,
    MAP_LAYER_URLS.BC_BASE_STYLE,
    'esri',
  );
  const canadaTopographicLayerBasic = useStyledLayer(
    MAP_LAYER_URLS.CANADA_TOPOGRAPHIC_LAYER,
    MAP_LAYER_URLS.CANADA_TOPOGRAPHIC_STYLE_BASIC,
    'esri',
  );

  const canadaTopographicLayerFull = useStyledLayer(
    MAP_LAYER_URLS.CANADA_TOPOGRAPHIC_LAYER,
    MAP_LAYER_URLS.CANADA_TOPOGRAPHIC_STYLE_FULL,
    'esri',
  );

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
            // World hillshade as base
            new TileLayer({
              source: new XYZ({
                url: MAP_LAYER_URLS.WORLD_HILLSHADE_TILE_LAYER,
                attributions: 'Esri World Hillshade',
                cacheSize: 512,
                maxZoom: 18,
              }),
              preload: 4,
              useInterimTilesOnError: true,
            }),
            // Canada hillshade overlaid
            new TileLayer({
              source: new XYZ({
                url: MAP_LAYER_URLS.CANADA_HILLSHADE_TILE_LAYER,
                attributions: 'Esri Canada Hillshade',
                cacheSize: 512,
                maxZoom: 18,
              }),
              preload: 4,
              useInterimTilesOnError: true,
            }),
            // World street map (similar style, fewer labels)
            new TileLayer({
              source: new XYZ({
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                attributions: 'Esri World Street Map',
                cacheSize: 512,
                maxZoom: 18,
              }),
              preload: 4,
              useInterimTilesOnError: true,
              opacity: 0.6, // Lower opacity to reduce label prominence
            }),
            // Canada topographic full
            canadaTopographicLayerFull,
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
                url: MAP_LAYER_URLS.ESRI_WORLD_IMAGERY_LAYER,
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
    [prpBaseLayer, canadaTopographicLayerBasic, canadaTopographicLayerFull],
  );

  return baseMaps;
};
