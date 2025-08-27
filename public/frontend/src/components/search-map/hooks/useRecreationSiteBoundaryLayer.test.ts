import { describe, it, expect, vi } from 'vitest';
import { useRecreationSiteBoundaryLayer } from '@/components/search-map/hooks/useRecreationSiteBoundaryLayer';
import * as recSiteBoundaryLayer from '@/components/search-map/layers/recreationSiteBoundaryLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

describe('useRecreationSiteBoundaryLayer', () => {
  it('calls useLayer with the correct arguments', () => {
    const mapRef = { current: {} } as any;
    const options = { someOption: true } as any;

    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue('hookReturnValue' as any);

    const result = useRecreationSiteBoundaryLayer(mapRef, options);

    expect(useLayerSpy).toHaveBeenCalledOnce();
    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      recSiteBoundaryLayer.createRecreationSiteBoundarySource,
      recSiteBoundaryLayer.createRecreationSiteBoundaryLayer,
      recSiteBoundaryLayer.createRecreationSiteBoundaryStyle,
      options,
    );
    expect(result).toBe('hookReturnValue');

    useLayerSpy.mockRestore();
  });
});
