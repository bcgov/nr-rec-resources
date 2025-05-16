import { getImageList } from '@/components/rec-resource/card/helpers';
import { RecreationResourceSearchModel } from '@/service/custom-models';
import { IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD } from '@/components/rec-resource/card/constants';

describe('getImageList', () => {
  it('should extract the correct size code size image from resource', () => {
    const mockResource: RecreationResourceSearchModel = {
      recreation_resource_images: [
        {
          recreation_resource_image_variants: [
            {
              size_code: IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD,
              url: 'image1.jpg',
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
              size_code: IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD,
              url: 'image2.jpg',
            },
          ],
        },
      ],
    } as RecreationResourceSearchModel;

    const result = getImageList(mockResource);

    expect(result).toEqual([
      { imageUrl: 'image1.jpg' },
      { imageUrl: 'image2.jpg' },
    ]);
  });

  it('should return empty array when no images exist for the required size code', () => {
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

  it('should sort images with landscape orientation before portrait', () => {
    const mockResource: RecreationResourceSearchModel = {
      recreation_resource_images: [
        {
          recreation_resource_image_variants: [
            {
              size_code: IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD,
              url: 'portrait.jpg',
              width: 600,
              height: 800,
            },
            {
              size_code: IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD,
              url: 'landscape.jpg',
              width: 1200,
              height: 800,
            },
          ],
        },
      ],
    } as unknown as RecreationResourceSearchModel;

    const result = getImageList(mockResource);

    expect(result).toEqual([
      { imageUrl: 'landscape.jpg' },
      { imageUrl: 'portrait.jpg' },
    ]);
  });
});
