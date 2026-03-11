import { renderHook } from '@testing-library/react';

// Mock dependencies
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetImagesByRecResourceId',
  () => ({
    useGetImagesByRecResourceId: vi.fn(),
  }),
);

vi.mock('@/pages/rec-resource-page/helpers', () => ({
  formatGalleryFileDate: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/findImageVariant', () => ({
  findImageVariant: vi.fn(),
}));

import { formatGalleryFileDate } from '@/pages/rec-resource-page/helpers';
import { useImageList } from '@/pages/rec-resource-page/hooks/useImageList';
import { useGetImagesByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetImagesByRecResourceId';
import { findImageVariant } from '@/pages/rec-resource-page/hooks/utils/findImageVariant';

describe('useImageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (formatGalleryFileDate as any).mockImplementation(
      (date: string) => `formatted-${date}`,
    );
    (findImageVariant as any).mockImplementation(
      (variants: any[], sizeCode: string) =>
        variants?.find((v) => v.size_code === sizeCode),
    );
  });

  it('should return empty array when no images from server', () => {
    (useGetImagesByRecResourceId as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useImageList('test-resource-id'));

    expect(result.current.galleryImagesFromServer).toEqual([]);
  });

  it('should transform images from server to gallery images', () => {
    const mockImagesFromServer = [
      {
        ref_id: 'image-1',
        image_id: 'image-1',
        file_name: 'test-image-1.webp',
        created_at: '2025-01-01T10:00:00Z',
        recreation_resource_image_variants: [
          {
            size_code: 'original',
            url: 'https://example.com/original.jpg',
            extension: 'jpg',
          },
          {
            size_code: 'pre',
            url: 'https://example.com/preview.jpg',
            extension: 'jpg',
          },
        ],
      },
      {
        ref_id: 'image-2',
        image_id: 'image-2',
        file_name: 'test-image-2.webp',
        created_at: '2025-01-02T10:00:00Z',
        recreation_resource_image_variants: [
          {
            size_code: 'original',
            url: 'https://example.com/original2.jpg',
            extension: 'jpg',
          },
        ],
      },
    ];

    (useGetImagesByRecResourceId as any).mockReturnValue({
      data: mockImagesFromServer,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useImageList('test-resource-id'));

    expect(result.current.galleryImagesFromServer).toEqual([
      {
        id: 'image-1',
        name: 'test-image-1.webp',
        date: 'formatted-2025-01-01T10:00:00Z',
        url: 'https://example.com/original.jpg',
        extension: 'jpg',
        previewUrl: 'https://example.com/preview.jpg',
        variants: mockImagesFromServer[0].recreation_resource_image_variants,
        type: 'image',
      },
      {
        id: 'image-2',
        name: 'test-image-2.webp',
        date: 'formatted-2025-01-02T10:00:00Z',
        url: 'https://example.com/original2.jpg',
        extension: 'jpg',
        previewUrl: undefined,
        variants: mockImagesFromServer[1].recreation_resource_image_variants,
        type: 'image',
      },
    ]);

    expect(formatGalleryFileDate).toHaveBeenCalledWith('2025-01-01T10:00:00Z');
    expect(formatGalleryFileDate).toHaveBeenCalledWith('2025-01-02T10:00:00Z');
  });

  it('should handle images without variants', () => {
    const mockImagesFromServer = [
      {
        ref_id: 'image-1',
        image_id: 'image-1',
        file_name: 'test-image-1.webp',
        created_at: '2025-01-01T10:00:00Z',
        recreation_resource_image_variants: null,
      },
    ];

    (useGetImagesByRecResourceId as any).mockReturnValue({
      data: mockImagesFromServer,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useImageList('test-resource-id'));

    expect(result.current.galleryImagesFromServer).toEqual([
      {
        id: 'image-1',
        name: 'test-image-1.webp',
        date: 'formatted-2025-01-01T10:00:00Z',
        url: undefined,
        extension: undefined,
        previewUrl: undefined,
        variants: [],
        type: 'image',
      },
    ]);
  });

  it('should pass through other properties from useGetImagesByRecResourceId', () => {
    const mockReturnValue = {
      data: [],
      isLoading: true,
      error: new Error('Test error'),
      refetch: vi.fn(),
      isFetching: true,
    };

    (useGetImagesByRecResourceId as any).mockReturnValue(mockReturnValue);

    const { result } = renderHook(() => useImageList('test-resource-id'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toEqual(new Error('Test error'));
    expect(result.current.refetch).toBe(mockReturnValue.refetch);
    expect(result.current.isFetching).toBe(true);
  });

  it('should call useGetImagesByRecResourceId with correct resource id', () => {
    (useGetImagesByRecResourceId as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderHook(() => useImageList('test-resource-id'));

    expect(useGetImagesByRecResourceId).toHaveBeenCalledWith(
      'test-resource-id',
    );
  });

  it('should map consent metadata fields from server response', () => {
    const mockImagesFromServer = [
      {
        ref_id: 'image-1',
        image_id: 'image-1',
        file_name: 'consent-image.webp',
        created_at: '2025-01-01T10:00:00Z',
        recreation_resource_image_variants: [
          {
            size_code: 'original',
            url: 'https://example.com/original.jpg',
            extension: 'jpg',
          },
        ],
        file_size: 2097152,
        date_taken: '2024-06-15',
        photographer_type: 'STAFF',
        photographer_type_description: 'Staff Member',
        photographer_name: 'Test User',
        photographer_display_name: 'Test User',
        contains_pii: true,
      },
    ];

    (useGetImagesByRecResourceId as any).mockReturnValue({
      data: mockImagesFromServer,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useImageList('test-resource-id'));

    const image = result.current.galleryImagesFromServer[0];
    expect(image.file_size).toBe(2097152);
    expect(image.date_taken).toBe('2024-06-15');
    expect(image.photographer_type).toBe('STAFF');
    expect(image.photographer_type_description).toBe('Staff Member');
    expect(image.photographer_name).toBe('Test User');
    expect(image.photographer_display_name).toBe('Test User');
    expect(image.contains_pii).toBe(true);
  });
});
