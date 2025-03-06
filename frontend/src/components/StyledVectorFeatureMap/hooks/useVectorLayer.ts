import { useEffect, useState } from 'react';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getCenter } from 'ol/extent';
import OlMap from 'ol/Map';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { StyleLike } from 'ol/style/Style';

interface UseVectorLayerProps {
  map: OlMap;
  features: Feature[];
  layerStyle?: StyleLike;
  onLayerAdded?: (center: Coordinate, extent: Coordinate) => void;
}
export const useVectorLayer = ({
  map,
  features,
  layerStyle,
  onLayerAdded,
}: UseVectorLayerProps) => {
  const [vectorSource, setVectorSource] = useState<VectorSource>();
  const [vectorLayer, setVectorLayer] = useState<VectorLayer>();

  useEffect(() => {
    if (!map || !features.length) return;

    const source = new VectorSource({ features });
    const layer = new VectorLayer({
      source,
      style: layerStyle,
    });

    setVectorSource(source);
    setVectorLayer(layer);
    map.addLayer(layer);

    const extent = source.getExtent();
    const center = getCenter(extent);

    map.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 1000,
    });

    onLayerAdded?.(center, extent);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, features, layerStyle, onLayerAdded]);

  return { vectorSource, vectorLayer };
};
