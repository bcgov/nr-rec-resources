import { Injectable, PipeTransform } from '@nestjs/common';
import { RecreationResourceImageSize } from '@shared/constants/images';
import { VALID_IMAGE_SIZES_CODES } from '../constants/image.constants';

/**
 * A pipe that transforms and validates image size query parameters.
 * Accepts single or multiple image size values and ensures they are valid.
 */
@Injectable()
export class ParseImageSizesPipe implements PipeTransform {
  /**
   * Creates a new instance of ParseImageSizesPipe
   * @param defaultSizes - The image sizes to return when input is invalid or empty
   */
  constructor(
    private readonly defaultSizes: RecreationResourceImageSize[] = [
      RecreationResourceImageSize.THUMBNAIL,
    ],
  ) {}

  /**
   * Transforms and validates the input into an array of image sizes
   * @param rawImageSizes - Query parameter value
   * @returns Array of valid image sizes, or default sizes if input is invalid
   */
  transform(rawImageSizes?: string | string[]): RecreationResourceImageSize[] {
    if (!rawImageSizes) {
      return this.defaultSizes;
    }

    const requestedSizes = Array.isArray(rawImageSizes)
      ? rawImageSizes
      : rawImageSizes.split(',');

    // Validate each size is a valid enum value
    const validatedSizes = requestedSizes.filter(
      (size): size is RecreationResourceImageSize =>
        VALID_IMAGE_SIZES_CODES.includes(size as RecreationResourceImageSize),
    );

    return validatedSizes.length ? validatedSizes : this.defaultSizes;
  }
}
