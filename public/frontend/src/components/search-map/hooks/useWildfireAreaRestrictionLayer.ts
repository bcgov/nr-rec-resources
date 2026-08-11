import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createWildfireAreaRestrictionLayer,
  createWildfireAreaRestrictionSource,
  createWildfireAreaRestrictionStyle,
} from '@/components/search-map/layers/wildfireAreaRestrictionLayer';

export const useWildfireAreaRestrictionLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createWildfireAreaRestrictionSource,
    createWildfireAreaRestrictionLayer,
    createWildfireAreaRestrictionStyle,
    options,
  );
