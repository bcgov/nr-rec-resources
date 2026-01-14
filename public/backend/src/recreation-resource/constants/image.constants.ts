import { RecreationResourceImageSize } from '@shared/constants/images';

/**
 * Array of valid image size codes derived from {@link RecreationResourceImageSize} enum
 * @description Contains all possible image size values that can be used for filtering
 * recreation resource images
 */
export const VALID_IMAGE_SIZES_CODES = Object.values(
  RecreationResourceImageSize,
);
