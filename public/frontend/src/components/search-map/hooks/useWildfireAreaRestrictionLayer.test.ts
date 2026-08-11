import { describe, it, expect, vi } from 'vitest';
import { useWildfireAreaRestrictionLayer } from '@/components/search-map/hooks/useWildfireAreaRestrictionLayer';
import * as restrictionLayer from '@/components/search-map/layers/wildfireAreaRestrictionLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

describe('useWildfireAreaRestrictionLayer', () => {
  it('calls useLayer with the correct arguments', () => {
    const mapRef = { current: {} } as any;
    const options = { someOption: true };

    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue('hookReturnValue' as any);

    const result = useWildfireAreaRestrictionLayer(mapRef, options as any);

    expect(useLayerSpy).toHaveBeenCalledOnce();
    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      restrictionLayer.createWildfireAreaRestrictionSource,
      restrictionLayer.createWildfireAreaRestrictionLayer,
      restrictionLayer.createWildfireAreaRestrictionStyle,
      options,
    );
    expect(result).toBe('hookReturnValue');

    useLayerSpy.mockRestore();
  });
});
