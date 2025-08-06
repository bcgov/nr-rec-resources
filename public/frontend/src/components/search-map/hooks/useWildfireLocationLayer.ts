import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createWildfireLocationSource,
  createWildfireLocationLayer,
  createWildfireLocationStyle,
} from '@/components/search-map/layers/wildfireLocationLayer';

export const useWildfireLocationLayer: UseLayer = (mapRef, options) => {
  return useLayer(
    mapRef,
    createWildfireLocationSource,
    createWildfireLocationLayer,
    createWildfireLocationStyle,
    options,
  );
};
