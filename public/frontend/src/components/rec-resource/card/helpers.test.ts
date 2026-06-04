import {
  getImageList,
  RecResourceCardResource,
} from '@/components/rec-resource/card/helpers';

describe('getImageList', () => {
  it('should extract image URLs from url.pre', () => {
    const mockResource = {
      recreation_resource_images: [
        {
          image_id: 'image-1',
          url: {
            pre: 'https://cdn.example.com/images/REC123/image-1/pre.webp',
          },
        },
        {
          image_id: 'image-2',
          url: {
            original:
              'https://cdn.example.com/images/REC123/image-2/original.webp',
            pre: 'https://cdn.example.com/images/REC123/image-2/pre.webp',
          },
        },
      ],
    } as unknown as RecResourceCardResource;

    const result = getImageList(mockResource);

    expect(result).toEqual([
      {
        imageUrl: 'https://cdn.example.com/images/REC123/image-1/pre.webp',
      },
      {
        imageUrl: 'https://cdn.example.com/images/REC123/image-2/pre.webp',
      },
    ]);
  });

  it('should fallback to url.original when url.pre is not available', () => {
    const mockResource = {
      recreation_resource_images: [
        {
          image_id: 'image-1',
          url: {
            original:
              'https://cdn.example.com/images/REC123/image-1/original.webp',
          },
        },
      ],
    } as unknown as RecResourceCardResource;

    const result = getImageList(mockResource);

    expect(result).toEqual([
      {
        imageUrl: 'https://cdn.example.com/images/REC123/image-1/original.webp',
      },
    ]);
  });

  it('should handle empty recreation_resource_images array', () => {
    const mockResource = {
      recreation_resource_images: [],
    } as unknown as RecResourceCardResource;

    const result = getImageList(mockResource);

    expect(result).toEqual([]);
  });

  it('should handle undefined recreation_resource_images', () => {
    const mockResource = {} as unknown as RecResourceCardResource;

    const result = getImageList(mockResource);

    expect(result).toEqual([]);
  });
});
