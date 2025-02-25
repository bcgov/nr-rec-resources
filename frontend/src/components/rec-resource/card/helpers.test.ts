import {
  RecreationResourceDto,
  RecreationResourceImageVariantDtoSizeCodeEnum,
} from '@/service/recreation-resource';
import { getImageList } from '@/components/rec-resource/card/helpers';

describe('getImageList', () => {
  it('should extract LLC size images from resource', () => {
    const mockResource: RecreationResourceDto = {
      recreation_resource_images: [
        {
          recreation_resource_image_variants: [
            {
              size_code: RecreationResourceImageVariantDtoSizeCodeEnum.Llc,
              url: 'image1-llc.jpg',
            },
            {
              size_code: RecreationResourceImageVariantDtoSizeCodeEnum.Thm,
              url: 'image1-small.jpg',
            },
          ],
        },
        {
          recreation_resource_image_variants: [
            {
              size_code: RecreationResourceImageVariantDtoSizeCodeEnum.Llc,
              url: 'image2-llc.jpg',
            },
          ],
        },
      ],
    } as RecreationResourceDto;

    const result = getImageList(mockResource);

    expect(result).toEqual([
      { imageUrl: 'image1-llc.jpg' },
      { imageUrl: 'image2-llc.jpg' },
    ]);
  });

  it('should return empty array when no LLC images exist', () => {
    const mockResource: RecreationResourceDto = {
      recreation_resource_images: [
        {
          recreation_resource_image_variants: [
            {
              size_code: RecreationResourceImageVariantDtoSizeCodeEnum.Thm,
              url: 'image1-small.jpg',
            },
          ],
        },
      ],
    } as RecreationResourceDto;

    const result = getImageList(mockResource);

    expect(result).toEqual([]);
  });

  it('should handle empty recreation_resource_images array', () => {
    const mockResource = {
      recreation_resource_images: [],
    } as unknown as RecreationResourceDto;

    const result = getImageList(mockResource);

    expect(result).toEqual([]);
  });
});
