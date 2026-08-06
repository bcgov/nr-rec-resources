import { describe, it, expect, vi } from 'vitest';
import { useFireEvacuationLayer } from '@/components/search-map/hooks/useFireEvacuationLayer';
import * as evacuationLayer from '@/components/search-map/layers/fireEvacuationLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

describe('useFireEvacuationLayer', () => {
  it('calls useLayer with the correct arguments', () => {
    const mapRef = { current: {} } as any;
    const options = { someOption: true };

    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue('hookReturnValue' as any);

    const result = useFireEvacuationLayer(mapRef, options as any);

    expect(useLayerSpy).toHaveBeenCalledOnce();
    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      evacuationLayer.createFireEvacuationSource,
      evacuationLayer.createFireEvacuationLayer,
      evacuationLayer.createFireEvacuationStyle,
      options,
    );
    expect(result).toBe('hookReturnValue');

    useLayerSpy.mockRestore();
  });
});
