/**
 * Enum representing available image size options for the recreation API
 */
export enum RecreationResourceImageSize {
  /** Original upload size */
  ORIGINAL = 'original',
  /** Thumbnail (175x175) */
  THUMBNAIL = 'thm',
  /** Preview (900x480) */
  PREVIEW = 'pre',
  /** Screen resolution (1400x800) */
  SCREEN = 'scr',
}

// Code for image size code used in search results card
export const IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD =
  RecreationResourceImageSize.PREVIEW;
