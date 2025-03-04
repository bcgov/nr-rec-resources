import { getImageList } from '@/components/rec-resource/card/helpers';
import { RecreationResourceSearchModel } from '@/service/custom-models';

describe('getImageList', () => {
  it('should extract LLC size images from resource', () => {
    const mockResource: RecreationResourceSearchModel = {
      recreation_resource_images: [
        {
          recreation_resource_image_variants: [
            {
              size_code: 'llc',
              url: 'image1-llc.jpg',
            },
            {
              size_code: 'thm',
              url: 'image1-small.jpg',
            },
          ],
        },
        {
          recreation_resource_image_variants: [
            {
              size_code: 'llc',
              url: 'image2-llc.jpg',
            },
          ],
        },
      ],
    } as RecreationResourceSearchModel;

    const result = getImageList(mockResource);

    expect(result).toEqual([
      { imageUrl: 'image1-llc.jpg' },
      { imageUrl: 'image2-llc.jpg' },
    ]);
  });

  it('should return empty array when no LLC images exist', () => {
    const mockResource: RecreationResourceSearchModel = {
      recreation_resource_images: [
        {
          recreation_resource_image_variants: [
            {
              size_code: 'thm',
              url: 'image1-small.jpg',
            },
          ],
        },
      ],
    } as RecreationResourceSearchModel;

    const result = getImageList(mockResource);

    expect(result).toEqual([]);
  });

  it('should handle empty recreation_resource_images array', () => {
    const mockResource = {
      recreation_resource_images: [],
    } as unknown as RecreationResourceSearchModel;

    const result = getImageList(mockResource);

    expect(result).toEqual([]);
  });
});
