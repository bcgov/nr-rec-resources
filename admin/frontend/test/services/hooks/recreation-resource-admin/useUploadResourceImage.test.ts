import { Mock, vi } from 'vitest';

// Mock dependencies first - this needs to be before imports
vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useUploadResourceImage } from '@/services/hooks/recreation-resource-admin/useUploadResourceImage';
import { ImageVariant } from '@/utils/imageProcessing';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook } from '@testing-library/react';

const createMockVariants = (): ImageVariant[] => [
  {
    sizeCode: 'original',
    blob: new Blob(['original'], { type: 'image/webp' }),
    width: 1920,
    height: 1080,
    file: new File(['original'], 'original.webp', { type: 'image/webp' }),
  },
  {
    sizeCode: 'scr',
    blob: new Blob(['scr'], { type: 'image/webp' }),
    width: 1400,
    height: 800,
    file: new File(['scr'], 'scr.webp', { type: 'image/webp' }),
  },
  {
    sizeCode: 'pre',
    blob: new Blob(['pre'], { type: 'image/webp' }),
    width: 900,
    height: 540,
    file: new File(['pre'], 'pre.webp', { type: 'image/webp' }),
  },
  {
    sizeCode: 'thm',
    blob: new Blob(['thm'], { type: 'image/webp' }),
    width: 250,
    height: 250,
    file: new File(['thm'], 'thm.webp', { type: 'image/webp' }),
  },
];

describe('useUploadResourceImage', () => {
  const mockApi = {
    createRecreationresourceImage: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('should return a mutation function', () => {
    const { result } = renderHook(() => useUploadResourceImage(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('should configure retry with createRetryHandler', () => {
    renderHook(() => useUploadResourceImage(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  describe('basic upload', () => {
    it('calls API with correct parameters for basic upload', async () => {
      const mockParams = {
        recResourceId: 'test-resource-id',
        variants: createMockVariants(),
        fileName: 'test-caption.webp',
      };

      mockApi.createRecreationresourceImage.mockResolvedValue({
        id: 'test-image-id',
      });

      const { result } = renderHook(() => useUploadResourceImage(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.mutateAsync(mockParams);

      expect(mockApi.createRecreationresourceImage).toHaveBeenCalledWith(
        expect.objectContaining({
          recResourceId: mockParams.recResourceId,
          fileName: mockParams.fileName,
          original: expect.any(Blob),
          scr: expect.any(Blob),
          pre: expect.any(Blob),
          thm: expect.any(Blob),
        }),
      );
    });
  });

  describe('upload with consent metadata', () => {
    const consentFile = new File(['consent'], 'consent.pdf', {
      type: 'application/pdf',
    });

    it.each([
      ['dateTaken', { dateTaken: '2024-01-15' }, { dateTaken: '2024-01-15' }],
      ['containsPii', { containsPii: true }, { containsPii: true }],
      [
        'photographerType',
        { photographerType: 'OTHER' },
        { photographerType: 'OTHER' },
      ],
      [
        'photographerName',
        { photographerName: 'John Photographer' },
        { photographerName: 'John Photographer' },
      ],
      [
        'consentFormFile',
        { consentFormFile: consentFile },
        { consentForm: consentFile },
      ],
    ])('passes %s to API', async (_, inputField, expectedField) => {
      const mockParams = {
        recResourceId: 'test-resource-id',
        variants: createMockVariants(),
        fileName: 'test.webp',
        ...inputField,
      };

      mockApi.createRecreationresourceImage.mockResolvedValue({
        id: 'test-image-id',
      });

      const { result } = renderHook(() => useUploadResourceImage(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.mutateAsync(mockParams);

      expect(mockApi.createRecreationresourceImage).toHaveBeenCalledWith(
        expect.objectContaining(expectedField),
      );
    });

    it('passes all consent metadata fields together', async () => {
      const consentFile = new File(['consent'], 'consent.pdf', {
        type: 'application/pdf',
      });

      const mockParams = {
        recResourceId: 'test-resource-id',
        variants: createMockVariants(),
        fileName: 'test.webp',
        dateTaken: '2024-01-15',
        containsPii: true,
        photographerType: 'OTHER',
        photographerName: 'John Photographer',
        consentFormFile: consentFile,
      };

      mockApi.createRecreationresourceImage.mockResolvedValue({
        id: 'test-image-id',
      });

      const { result } = renderHook(() => useUploadResourceImage(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.mutateAsync(mockParams);

      expect(mockApi.createRecreationresourceImage).toHaveBeenCalledWith(
        expect.objectContaining({
          recResourceId: 'test-resource-id',
          fileName: 'test.webp',
          dateTaken: '2024-01-15',
          containsPii: true,
          photographerType: 'OTHER',
          photographerName: 'John Photographer',
          consentForm: consentFile,
        }),
      );
    });
  });
});
