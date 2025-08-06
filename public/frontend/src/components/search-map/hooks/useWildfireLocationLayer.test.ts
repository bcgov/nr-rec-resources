import { describe, it, expect, vi } from 'vitest';
import { useWildfireLocationLayer } from '@/components/search-map/hooks/useWildfireLocationLayer';
import * as wildfireLayer from '@/components/search-map/layers/wildfireLocationLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

describe('useWildfireLocationLayer', () => {
  it('calls useLayer with the correct arguments', () => {
    const mapRef = { current: {} } as any;
    const options = { someOption: true };

    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue('hookReturnValue' as any);

    const result = useWildfireLocationLayer(mapRef, options as any);

    expect(useLayerSpy).toHaveBeenCalledOnce();
    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      wildfireLayer.createWildfireLocationSource,
      wildfireLayer.createWildfireLocationLayer,
      wildfireLayer.createWildfireLocationStyle,
      options,
    );
    expect(result).toBe('hookReturnValue');

    useLayerSpy.mockRestore();
  });
});
