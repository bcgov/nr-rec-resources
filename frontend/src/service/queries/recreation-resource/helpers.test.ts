import { RecreationResourceDto } from '@/service/recreation-resource';
import {
  getBasePathForAssets,
  transformRecreationResource,
} from '@/service/queries/recreation-resource/helpers';

describe('Asset URL Utilities', () => {
  describe('getBasePathForAssets', () => {
    it('returns environment variable when set', () => {
      vi.stubEnv(
        'VITE_RECREATION_RESOURCE_ASSETS_BASE_URL',
        'https://custom-domain.com',
      );
      expect(getBasePathForAssets()).toBe('https://custom-domain.com');
      vi.unstubAllEnvs();
    });

    it('returns default test URL when environment variable not set', () => {
      expect(getBasePathForAssets()).toBe(
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca',
      );
    });
  });

  describe('transformRecreationResource', () => {
    const mockResource = {
      rec_resource_id: 1,
      recreation_resource_images: [
        {
          rec_resource_id: 1,
          recreation_resource_image_variants: [
            {
              ref_id: 1,
              url: '/images/test1.jpg',
              size_code: 'pcs',
            },
            {
              ref_id: 2,
              url: '/images/test2.jpg',
              size_code: 'pcs',
            },
          ],
        },
      ],
    } as unknown as RecreationResourceDto;

    it('transforms all image URLs with base path', () => {
      const transformed = transformRecreationResource(mockResource);
      const basePath = getBasePathForAssets();

      expect(
        transformed.recreation_resource_images[0]
          .recreation_resource_image_variants[0].url,
      ).toBe(`${basePath}/images/test1.jpg`);
      expect(
        transformed.recreation_resource_images[0]
          .recreation_resource_image_variants[1].url,
      ).toBe(`${basePath}/images/test2.jpg`);
    });

    it('preserves original resource structure', () => {
      const transformed = transformRecreationResource(mockResource);

      expect(transformed.rec_resource_id).toBe(mockResource.rec_resource_id);
      expect(transformed.recreation_resource_images[0].ref_id).toBe(
        mockResource.recreation_resource_images[0].ref_id,
      );
      expect(
        transformed.recreation_resource_images[0]
          .recreation_resource_image_variants[0].size_code,
      ).toBe(
        mockResource.recreation_resource_images[0]
          .recreation_resource_image_variants[0].size_code,
      );
    });

    it('handles empty image arrays', () => {
      const emptyResource = {
        rec_resource_id: 1,
        recreation_resource_images: [],
      } as unknown as RecreationResourceDto;

      expect(() => transformRecreationResource(emptyResource)).not.toThrow();
      expect(
        transformRecreationResource(emptyResource).recreation_resource_images,
      ).toEqual([]);
    });
  });
});
