import { useEffect, useMemo } from 'react';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { applyStyle } from 'ol-mapbox-style';
import { useGetMapStyles } from '@/service/queries/map-service';

export const useMapBaseLayers = () => {
  const baseLayers = useMemo(() => {
    return [
      new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{x}/{y}.pbf',
        }),
      }),
    ];
  }, []);

  const { data: glStyles } = useGetMapStyles();

  // apply styles to each base layer
  useEffect(() => {
    baseLayers.forEach((baseLayer) => {
      applyStyle(baseLayer, glStyles, 'esri');
    });
  }, [glStyles, baseLayers]);

  return baseLayers;
};
