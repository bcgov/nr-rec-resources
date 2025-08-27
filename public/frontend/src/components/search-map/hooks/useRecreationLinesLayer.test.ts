import { describe, it, expect, vi } from 'vitest';
import { useRecreationLinesLayer } from '@/components/search-map/hooks/useRecreationLinesLayer';
import * as recLinesLayer from '@/components/search-map/layers/recreationLinesLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

describe('useRecreationLinesLayer', () => {
  it('calls useLayer with the correct arguments', () => {
    const mapRef = { current: {} } as any;
    const options = { someOption: true } as any;

    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue('hookReturnValue' as any);

    const result = useRecreationLinesLayer(mapRef, options);

    expect(useLayerSpy).toHaveBeenCalledOnce();
    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      recLinesLayer.createRecreationLinesSource,
      recLinesLayer.createRecreationLinesLayer,
      recLinesLayer.createRecreationLineStyle,
      options,
    );
    expect(result).toBe('hookReturnValue');

    useLayerSpy.mockRestore();
  });
});
