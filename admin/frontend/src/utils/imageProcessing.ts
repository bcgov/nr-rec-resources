import { MAX_IMAGE_SIZE_MB } from '@/pages/rec-resource-page/helpers';

export interface ImageVariant {
  sizeCode: 'original' | 'scr' | 'pre' | 'thm';
  blob: Blob;
  width: number;
  height: number;
  file: File;
}

export interface ProcessImageOptions {
  file: File;
  maxResolution?: { width: number; height: number }; // Default: 3840x2160 (4K)
  quality?: number; // WebP quality, default: 0.85
  onProgress?: (progress: number, stage: string) => void;
}

export interface ImageValidationError {
  type: 'size' | 'dimensions' | 'format' | 'loading' | 'webp';
  message: string;
  details?: { width?: number; height?: number; size?: number };
}

// Constants
const MAX_FILE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024; // Uses MAX_IMAGE_SIZE_MB from helpers
const DEFAULT_MAX_RESOLUTION = { width: 3840, height: 2160 }; // 4K
const DEFAULT_WEBP_QUALITY = 0.85;

const VARIANT_SIZES = {
  scr: { width: 1400, height: 800, name: 'Screen' },
  pre: { width: 900, height: 540, name: 'Preview' },
  thm: { width: 250, height: 250, name: 'Thumbnail' },
};

// Progress percentages
const PROGRESS = {
  VALIDATING: 0,
  LOADING: 10,
  ORIGINAL: 25,
  SCREEN: 50,
  PREVIEW: 75,
  THUMBNAIL: 90,
  COMPLETE: 100,
} as const;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Check if WebP format is supported by the browser
 */
function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get canvas context with error handling
 */
function getCanvasContext(
  canvas: HTMLCanvasElement,
  contextType: '2d' = '2d',
): CanvasRenderingContext2D {
  const ctx = canvas.getContext(contextType);
  if (!ctx) {
    throw new Error(`Failed to get canvas context: ${contextType}`);
  }
  return ctx;
}

/**
 * Configure canvas context for high-quality image rendering
 */
function configureCanvasQuality(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

/**
 * Validate image file before processing (without loading image)
 */
function validateImageBasic(file: File): ImageValidationError | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    console.debug('[Image Processing] Image rejected - too large', {
      fileName: file.name,
      fileSizeBytes: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
      maxSizeBytes: MAX_FILE_SIZE,
      maxSizeMB: (MAX_FILE_SIZE / 1024 / 1024).toFixed(2),
      exceedsByBytes: file.size - MAX_FILE_SIZE,
      exceedsByMB: ((file.size - MAX_FILE_SIZE) / 1024 / 1024).toFixed(2),
    });
    return {
      type: 'size',
      message: `Image too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      details: { size: file.size },
    };
  }

  // Check file type
  if (
    !VALID_IMAGE_TYPES.includes(file.type as (typeof VALID_IMAGE_TYPES)[number])
  ) {
    return {
      type: 'format',
      message: `Invalid image format: ${file.type}. Supported formats: JPEG, PNG, WebP`,
    };
  }

  return null;
}

/**
 * Load image and create canvas (downscaling if needed to fit max resolution)
 */
async function loadAndValidateImage(
  file: File,
  maxResolution: { width: number; height: number },
): Promise<{ canvas: HTMLCanvasElement; error: ImageValidationError | null }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate dimensions (downscale if needed to fit within max resolution)
      const dimensions = calculateContainDimensions(
        img.width,
        img.height,
        maxResolution.width,
        maxResolution.height,
      );

      // Create canvas with calculated dimensions
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const ctx = getCanvasContext(canvas);
      configureCanvasQuality(ctx);

      // Draw image (will be downscaled if dimensions are smaller than original)
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

      resolve({ canvas, error: null });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        canvas: null as any,
        error: {
          type: 'loading',
          message: 'Failed to load image',
        },
      });
    };

    img.src = url;
  });
}

/**
 * Validate image file before processing
 * @deprecated This function loads the image separately. Use processImageToVariants which combines validation and loading.
 */
export async function validateImage(
  file: File,
  maxResolution = DEFAULT_MAX_RESOLUTION,
): Promise<ImageValidationError | null> {
  // Basic validation (size, format)
  const basicError = validateImageBasic(file);
  if (basicError) {
    return basicError;
  }

  // Load and check dimensions
  const { error } = await loadAndValidateImage(file, maxResolution);
  return error;
}

/**
 * Calculate dimensions to fit within max bounds while maintaining aspect ratio
 */
function calculateContainDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale

  return {
    width: Math.round(sourceWidth * ratio),
    height: Math.round(sourceHeight * ratio),
  };
}

/**
 * Calculate dimensions for cover crop (fill square, crop center)
 */
function calculateCoverDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetSize: number,
): {
  width: number;
  height: number;
  sourceX: number;
  sourceY: number;
  sourceSize: number;
} {
  const minDimension = Math.min(sourceWidth, sourceHeight);

  // Center crop from source
  const sourceSize = minDimension;
  const sourceX = (sourceWidth - sourceSize) / 2;
  const sourceY = (sourceHeight - sourceSize) / 2;

  return {
    width: targetSize,
    height: targetSize,
    sourceX,
    sourceY,
    sourceSize,
  };
}

/**
 * Convert canvas to WebP blob
 */
function canvasToWebP(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to WebP'));
        }
      },
      'image/webp',
      quality,
    );
  });
}

/**
 * Create a variant from canvas with specified dimensions and filename
 */
async function createVariantFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  sizeCode: ImageVariant['sizeCode'],
  width: number,
  height: number,
  quality: number,
  filename: string,
  drawFn: (
    ctx: CanvasRenderingContext2D,
    targetCanvas: HTMLCanvasElement,
  ) => void,
): Promise<ImageVariant> {
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = width;
  targetCanvas.height = height;

  const ctx = getCanvasContext(targetCanvas);
  configureCanvasQuality(ctx);
  drawFn(ctx, targetCanvas);

  const blob = await canvasToWebP(targetCanvas, quality);
  const file = new File([blob], filename, { type: 'image/webp' });

  return {
    sizeCode,
    blob,
    width,
    height,
    file,
  };
}

/**
 * Process original image to WebP (preserve dimensions up to 4K)
 */
async function processOriginal(
  sourceCanvas: HTMLCanvasElement,
  quality: number,
  maxResolution: { width: number; height: number },
): Promise<ImageVariant> {
  const { width: sourceWidth, height: sourceHeight } = sourceCanvas;

  // Check if we need to downscale
  if (
    sourceWidth <= maxResolution.width &&
    sourceHeight <= maxResolution.height
  ) {
    // No downscaling needed, just convert to WebP
    return createVariantFromCanvas(
      sourceCanvas,
      'original',
      sourceWidth,
      sourceHeight,
      quality,
      'original.webp',
      (ctx) => {
        ctx.drawImage(sourceCanvas, 0, 0);
      },
    );
  }

  // Downscale to max resolution
  const dimensions = calculateContainDimensions(
    sourceWidth,
    sourceHeight,
    maxResolution.width,
    maxResolution.height,
  );

  return createVariantFromCanvas(
    sourceCanvas,
    'original',
    dimensions.width,
    dimensions.height,
    quality,
    'original.webp',
    (ctx) => {
      ctx.drawImage(sourceCanvas, 0, 0, dimensions.width, dimensions.height);
    },
  );
}

/**
 * Process screen/preview variant (maintain aspect ratio, fit within bounds)
 */
async function processContainVariant(
  sourceCanvas: HTMLCanvasElement,
  sizeCode: 'scr' | 'pre',
  quality: number,
): Promise<ImageVariant> {
  const variantSize = VARIANT_SIZES[sizeCode];
  const { width: sourceWidth, height: sourceHeight } = sourceCanvas;

  const dimensions = calculateContainDimensions(
    sourceWidth,
    sourceHeight,
    variantSize.width,
    variantSize.height,
  );

  return createVariantFromCanvas(
    sourceCanvas,
    sizeCode,
    dimensions.width,
    dimensions.height,
    quality,
    `${sizeCode}.webp`,
    (ctx) => {
      ctx.drawImage(sourceCanvas, 0, 0, dimensions.width, dimensions.height);
    },
  );
}

/**
 * Process thumbnail variant (square, center crop)
 */
async function processThumbnail(
  sourceCanvas: HTMLCanvasElement,
  quality: number,
): Promise<ImageVariant> {
  const targetSize = VARIANT_SIZES.thm.width;
  const { width: sourceWidth, height: sourceHeight } = sourceCanvas;

  const cropDimensions = calculateCoverDimensions(
    sourceWidth,
    sourceHeight,
    targetSize,
  );

  return createVariantFromCanvas(
    sourceCanvas,
    'thm',
    targetSize,
    targetSize,
    quality,
    'thm.webp',
    (ctx) => {
      // Draw cropped and scaled image in one step
      ctx.drawImage(
        sourceCanvas,
        cropDimensions.sourceX,
        cropDimensions.sourceY,
        cropDimensions.sourceSize,
        cropDimensions.sourceSize,
        0,
        0,
        targetSize,
        targetSize,
      );
    },
  );
}

/**
 * Main function: Process image into 4 WebP variants
 */
export async function processImageToVariants(
  options: ProcessImageOptions,
): Promise<ImageVariant[]> {
  const {
    file,
    maxResolution = DEFAULT_MAX_RESOLUTION,
    quality = DEFAULT_WEBP_QUALITY,
    onProgress,
  } = options;

  try {
    // Check WebP support
    onProgress?.(PROGRESS.VALIDATING, 'Checking WebP support...');
    if (!isWebPSupported()) {
      throw new Error(
        'WebP format is not supported in this browser. Please use a modern browser.',
      );
    }

    // Basic validation (size, format) - fast check before loading
    onProgress?.(PROGRESS.VALIDATING, 'Validating image...');
    const basicError = validateImageBasic(file);
    if (basicError) {
      throw new Error(basicError.message);
    }

    // Load image and validate dimensions in one step
    onProgress?.(PROGRESS.LOADING, 'Loading image...');
    const { canvas: sourceCanvas, error: validationError } =
      await loadAndValidateImage(file, maxResolution);

    if (validationError) {
      throw new Error(validationError.message);
    }

    // Process variants
    const variants: ImageVariant[] = [];

    // Original (25% progress)
    onProgress?.(PROGRESS.ORIGINAL, 'Processing original...');
    const original = await processOriginal(
      sourceCanvas,
      quality,
      maxResolution,
    );
    variants.push(original);

    // Screen (50% progress)
    onProgress?.(PROGRESS.SCREEN, 'Processing screen size...');
    const scr = await processContainVariant(sourceCanvas, 'scr', quality);
    variants.push(scr);

    // Preview (75% progress)
    onProgress?.(PROGRESS.PREVIEW, 'Processing preview size...');
    const pre = await processContainVariant(sourceCanvas, 'pre', quality);
    variants.push(pre);

    // Thumbnail (90% progress)
    onProgress?.(PROGRESS.THUMBNAIL, 'Processing thumbnail...');
    const thm = await processThumbnail(sourceCanvas, quality);
    variants.push(thm);

    onProgress?.(PROGRESS.COMPLETE, 'Complete!');

    return variants;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process image: ${errorMessage}`);
  }
}

/**
 * Utility: Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Utility: Format dimensions for display
 */
export function formatDimensions(width: number, height: number): string {
  const megapixels = (width * height) / 1000000;
  return `${width}×${height} (${megapixels.toFixed(1)}MP)`;
}
