import { useEffect, useState } from 'react';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { StyleLike } from 'ol/style/Style';

interface UseVectorLayerProps {
  /** OpenLayers map instance */
  map: OlMap;
  /** Array of features to display */
  features: Feature[];
  /** Style configuration for the layer */
  layerStyle?: StyleLike;
  /** Callback fired when layer is added to map */
  onLayerAdded?: (extent: Coordinate) => void;
}

/**
 * Hook that manages vector layer creation and updates on the given map
 * with the given features
 * @param props - Vector layer configuration
 */
export const useAddVectorLayerToMap = ({
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

    // call the callback function with the extent
    const extent = source.getExtent();
    onLayerAdded?.(extent);

    // Cleanup function to remove layer
    return () => {
      map.removeLayer(layer);
    };
  }, [map, features, layerStyle, onLayerAdded]);

  return { vectorSource, vectorLayer };
};
