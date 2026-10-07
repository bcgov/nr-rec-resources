import { useStyledLayer } from '@bcgov/prp-map';
import {
  BC_BASE_LAYER_URLS,
  CANADA_TOPO_LAYER_URLS,
  WORLD_BASEMAP_V2_URLS,
} from '../constants';

export const useBaseMapStyledLayers = () => {
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

  return {
    prpBaseLayer,
    canadaTopographicLayerBasic,
    worldBasemapV2Layer,
  };
};
