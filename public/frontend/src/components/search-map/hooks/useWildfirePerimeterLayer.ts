import { useLayer, UseLayer } from '@/components/search-map/hooks/useLayer';
import {
  createWildfirePerimeterLayer,
  createWildfirePerimeterSource,
  createWildfirePerimeterStyle,
} from '@/components/search-map/layers/wildfirePerimeterLayer';

export const useWildfirePerimeterLayer: UseLayer = (mapRef, options) =>
  useLayer(
    mapRef,
    createWildfirePerimeterSource,
    createWildfirePerimeterLayer,
    createWildfirePerimeterStyle,
    options,
  );
