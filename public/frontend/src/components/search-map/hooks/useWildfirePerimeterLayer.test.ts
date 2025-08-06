import { describe, it, expect, vi } from 'vitest';
import { useWildfirePerimeterLayer } from '@/components/search-map/hooks/useWildfirePerimeterLayer';
import * as perimeterLayer from '@/components/search-map/layers/wildfirePerimeterLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

describe('useWildfirePerimeterLayer', () => {
  it('calls useLayer with the correct arguments', () => {
    const mapRef = { current: {} } as any;
    const options = { someOption: true };

    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue('hookReturnValue' as any);

    const result = useWildfirePerimeterLayer(mapRef, options as any);

    expect(useLayerSpy).toHaveBeenCalledOnce();
    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      perimeterLayer.createWildfirePerimeterSource,
      perimeterLayer.createWildfirePerimeterLayer,
      perimeterLayer.createWildfirePerimeterStyle,
      options,
    );
    expect(result).toBe('hookReturnValue');

    useLayerSpy.mockRestore();
  });
});
