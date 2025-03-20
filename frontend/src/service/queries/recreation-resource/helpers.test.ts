import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getBasePathForAssets,
  transformRecreationResourceBase,
  transformRecreationResourceDetail,
} from '@/service/queries/recreation-resource/helpers';
import {
  RecreationResourceBaseModel,
  RecreationResourceDetailModel,
} from '@/service/custom-models';

describe('Asset URL Utilities', () => {
  const DEFAULT_TEST_URL = 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca';
  const CUSTOM_URL = 'https://custom-domain.com';

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getBasePathForAssets', () => {
    it('returns environment variable when set', () => {
      vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', CUSTOM_URL);
      expect(getBasePathForAssets()).toBe(CUSTOM_URL);
    });

    it('returns default test URL when environment variable is empty', () => {
      vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', '');
      expect(getBasePathForAssets()).toBe(DEFAULT_TEST_URL);
    });

    it('returns default test URL when environment variable is undefined', () => {
      vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', undefined);
      expect(getBasePathForAssets()).toBe(DEFAULT_TEST_URL);
    });
  });

  describe('Resource Transformations', () => {
    const mockBaseResource = {
      rec_resource_id: 1,
      recreation_resource_images: [
        {
          rec_resource_id: 1,
          recreation_resource_image_variants: [
            { ref_id: 1, url: '/images/test1.jpg', size_code: 'pcs' },
            { ref_id: 2, url: '/images/test2.jpg', size_code: 'pcs' },
          ],
        },
      ],
    } as unknown as RecreationResourceBaseModel;

    describe('transformRecreationResourceBase', () => {
      it('correctly transforms image URLs with base path', () => {
        const transformed = transformRecreationResourceBase(mockBaseResource);
        const basePath = getBasePathForAssets();

        transformed.recreation_resource_images[0].recreation_resource_image_variants.forEach(
          (variant, index) => {
            expect(variant.url).toBe(`${basePath}/images/test${index + 1}.jpg`);
          },
        );
      });

      it('maintains original data structure', () => {
        const transformed = transformRecreationResourceBase(mockBaseResource);
        expect(transformed.rec_resource_id).toBe(
          mockBaseResource.rec_resource_id,
        );
        expect(transformed.recreation_resource_images).toHaveLength(1);
      });

      it('handles resources with no images', () => {
        const emptyResource = {
          rec_resource_id: 1,
          recreation_resource_images: [],
        } as unknown as RecreationResourceBaseModel;

        const transformed = transformRecreationResourceBase(emptyResource);
        expect(transformed.recreation_resource_images).toEqual([]);
      });
    });

    describe('transformRecreationResourceDetail', () => {
      const mockDetailResource = {
        ...mockBaseResource,
        spatial_feature_geometry: { type: 'Point', coordinates: [0, 0] },
        recreation_resource_docs: [
          { id: 1, url: '/docs/test.pdf', name: 'Test Doc' },
        ],
      } as unknown as RecreationResourceDetailModel;

      it('transforms both images and document URLs', () => {
        const transformed =
          transformRecreationResourceDetail(mockDetailResource);
        const basePath = getBasePathForAssets();

        expect(transformed.recreation_resource_docs![0].url).toBe(
          `${basePath}/docs/test.pdf`,
        );
      });

      it('preserves spatial feature data', () => {
        const transformed =
          transformRecreationResourceDetail(mockDetailResource);
        expect(transformed.spatial_feature_geometry).toEqual(
          mockDetailResource.spatial_feature_geometry,
        );
      });

      it('handles missing optional fields', () => {
        const partialResource = {
          ...mockBaseResource,
          recreation_resource_docs: [],
        } as unknown as RecreationResourceDetailModel;

        expect(() =>
          transformRecreationResourceDetail(partialResource),
        ).not.toThrow();
      });
    });
  });
});
