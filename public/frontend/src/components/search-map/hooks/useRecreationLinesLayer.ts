import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createRecreationLinesLayer,
  createRecreationLinesSource,
  createRecreationLineStyle,
} from '@/components/search-map/layers/recreationLinesLayer';

export const useRecreationLinesLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createRecreationLinesSource,
    createRecreationLinesLayer,
    createRecreationLineStyle,
    options,
  );
