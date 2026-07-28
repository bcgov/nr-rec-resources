import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createFireEvacuationLayer,
  createFireEvacuationSource,
  createFireEvacuationStyle,
} from '@/components/search-map/layers/fireEvacuationLayer';

export const useFireEvacuationLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createFireEvacuationSource,
    createFireEvacuationLayer,
    createFireEvacuationStyle,
    options,
  );
