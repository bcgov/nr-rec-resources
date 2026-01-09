import {
  RecreationResourceImageDto,
  RecreationResourceImageUrlDto,
} from 'src/recreation-resource/dto/recreation-resource-image.dto';
import { RecreationResourceImageSize } from '@shared/constants/images';

interface FormatImageUrlsOptions {
  images: Array<{ image_id: string }>;
  recResourceId: string;
  baseUrl: string;
  imageSizeCodes?: RecreationResourceImageSize[];
}

const IMAGE_FILE_EXTENSION = 'webp';

/**
 * Format image data into RecreationResourceImageDto with URLs for requested size codes.
 * Only returns URLs for the specified size codes (defaults to 'original' only).
 */
export const formatImageUrls = ({
  images,
  recResourceId,
  baseUrl,
  imageSizeCodes = [RecreationResourceImageSize.ORIGINAL],
}: FormatImageUrlsOptions): RecreationResourceImageDto[] => {
  return (images ?? []).map((img) => {
    const imageBaseUrl = `${baseUrl}/images/${recResourceId}/${img.image_id}`;

    const url = imageSizeCodes.reduce((acc, sizeCode) => {
      acc[sizeCode] = `${imageBaseUrl}/${sizeCode}.${IMAGE_FILE_EXTENSION}`;
      return acc;
    }, {} as RecreationResourceImageUrlDto);

    return { image_id: img.image_id, url };
  });
};
