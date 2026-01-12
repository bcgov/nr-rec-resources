import {
  formatDimensions,
  formatFileSize,
  processImageToVariants,
  validateImage,
} from '@/utils/imageProcessing';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// Shared test helper
const makeFile = (size: number, type: string = 'image/jpeg') => {
  const file = new File([''], 'test.jpg', { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
};

describe('imageProcessing', () => {
  // Mock Image
  let mockImage: {
    width: number;
    height: number;
    onload: (() => void) | null;
    onerror: (() => void) | null;
    src: string;
  };

  // Mock Canvas
  let mockCanvas: {
    width: number;
    height: number;
    toBlob: (
      callback: (blob: Blob | null) => void,
      type: string,
      quality: number,
    ) => void;
    toDataURL: (type?: string) => string;
    getContext: (contextType: string) => any;
  };
  let mockContext: {
    drawImage: ReturnType<typeof vi.fn>;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: string;
  };

  // Mock URL
  const mockObjectUrl = 'blob:http://localhost/test';
  const mockCreateObjectURL = vi.fn(() => mockObjectUrl);
  const mockRevokeObjectURL = vi.fn();

  // Mock factory for Image
  const createMockImage = (width = 1920, height = 1080) => ({
    width,
    height,
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
    src: '',
  });

  // Mock factory for Canvas
  const createMockCanvas = () => ({
    width: 0,
    height: 0,
    toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      callback(blob);
    }),
    toDataURL: vi.fn((type?: string) => {
      if (type === 'image/webp') {
        return 'data:image/webp;base64,test';
      }
      return 'data:image/png;base64,test';
    }),
    getContext: vi.fn((contextType: string) => {
      if (contextType === '2d') {
        return mockContext;
      }
      return null;
    }),
  });

  beforeAll(() => {
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    } as any;

    global.document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      if (tagName === 'img') {
        return mockImage as any;
      }
      return {} as any;
    }) as any;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockImage = createMockImage();
    mockContext = {
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    };
    mockCanvas = createMockCanvas();

    global.Image = class {
      width = 0;
      height = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        Object.assign(this, mockImage);
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('validateImage', () => {
    it('should return null for valid image', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 1920;
      mockImage.height = 1080;

      const result = await validateImage(file);

      expect(result).toBeNull();
      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    });

    it('should return error for file too large', async () => {
      const file = makeFile(6 * 1024 * 1024, 'image/jpeg');

      const result = await validateImage(file);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('size');
      expect(result?.message).toContain('too large');
      expect(result?.details?.size).toBe(6 * 1024 * 1024);
    });

    it('should return error for invalid file type', async () => {
      const file = makeFile(1024 * 1024, 'image/gif');

      const result = await validateImage(file);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('format');
      expect(result?.message).toContain('Invalid image format');
    });

    it('should downscale images with dimensions too large instead of returning error', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 5000;
      mockImage.height = 3000;

      const result = await validateImage(file, { width: 3840, height: 2160 });

      // Should return null (no error) because image is automatically downscaled
      expect(result).toBeNull();
      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
      // Verify canvas was created with downscaled dimensions
      expect(mockCanvas.width).toBeLessThanOrEqual(3840);
      expect(mockCanvas.height).toBeLessThanOrEqual(2160);
    });

    it('should return error when image fails to load', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      global.Image = class {
        width = 0;
        height = 0;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      } as any;

      const result = await validateImage(file);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('loading');
      expect(result?.message).toContain('Failed to load image');
    });

    it('should downscale images to fit custom maxResolution', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 2000;
      mockImage.height = 1500;

      const result = await validateImage(file, { width: 1920, height: 1080 });

      // Should return null (no error) because image is automatically downscaled
      expect(result).toBeNull();
      // Verify canvas was created with downscaled dimensions
      expect(mockCanvas.width).toBeLessThanOrEqual(1920);
      expect(mockCanvas.height).toBeLessThanOrEqual(1080);
    });
  });

  describe('formatFileSize', () => {
    it.each([
      [512, '512 B'],
      [0, '0 B'],
      [1024, '1.00 KB'],
      [1536, '1.50 KB'],
      [1024 * 512, '512.00 KB'],
      [1024 * 1024, '1.00 MB'],
      [1024 * 1024 * 2.5, '2.50 MB'],
      [1024 * 1024 * 10, '10.00 MB'],
    ])('should format %d bytes as %s', (bytes, expected) => {
      expect(formatFileSize(bytes)).toBe(expected);
    });
  });

  describe('formatDimensions', () => {
    it.each([
      [1920, 1080, '1920×1080 (2.1MP)'],
      [3840, 2160, '3840×2160 (8.3MP)'],
      [100, 100, '100×100 (0.0MP)'],
      [8000, 6000, '8000×6000 (48.0MP)'],
    ])('should format %dx%d as %s', (width, height, expected) => {
      expect(formatDimensions(width, height)).toBe(expected);
    });
  });

  describe('processImageToVariants', () => {
    beforeEach(() => {
      mockCanvas.width = 1920;
      mockCanvas.height = 1080;
    });

    it('should process image to 4 variants and work without onProgress', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 1920;
      mockImage.height = 1080;

      const variants = await processImageToVariants({ file });

      expect(variants).toHaveLength(4);
      expect(variants[0].sizeCode).toBe('original');
      expect(variants[1].sizeCode).toBe('scr');
      expect(variants[2].sizeCode).toBe('pre');
      expect(variants[3].sizeCode).toBe('thm');
      variants.forEach((variant) => {
        expect(variant).toHaveProperty('sizeCode');
        expect(variant).toHaveProperty('blob');
        expect(variant).toHaveProperty('width');
        expect(variant).toHaveProperty('height');
        expect(variant).toHaveProperty('file');
        expect(variant.blob).toBeInstanceOf(Blob);
        expect(variant.file).toBeInstanceOf(File);
      });
    });

    it('should call onProgress callback with correct values', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 1920;
      mockImage.height = 1080;
      const onProgress = vi.fn();

      await processImageToVariants({ file, onProgress });

      expect(onProgress).toHaveBeenCalledWith(0, 'Checking WebP support...');
      expect(onProgress).toHaveBeenCalledWith(0, 'Validating image...');
      expect(onProgress).toHaveBeenCalledWith(10, 'Loading image...');
      expect(onProgress).toHaveBeenCalledWith(25, 'Processing original...');
      expect(onProgress).toHaveBeenCalledWith(50, 'Processing screen size...');
      expect(onProgress).toHaveBeenCalledWith(75, 'Processing preview size...');
      expect(onProgress).toHaveBeenCalledWith(90, 'Processing thumbnail...');
      expect(onProgress).toHaveBeenCalledWith(100, 'Complete!');
    });

    it('should handle validation errors', async () => {
      const file = makeFile(6 * 1024 * 1024, 'image/jpeg');

      await expect(processImageToVariants({ file })).rejects.toThrow(
        'Failed to process image',
      );
    });

    it('should handle processing errors', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 1920;
      mockImage.height = 1080;
      mockCanvas.toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
        callback(null);
      });

      await expect(processImageToVariants({ file })).rejects.toThrow(
        'Failed to process image',
      );
    });

    it('should handle WebP not supported', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,test');

      await expect(processImageToVariants({ file })).rejects.toThrow(
        'WebP format is not supported',
      );
    });

    it('should use custom maxResolution and quality', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 1920;
      mockImage.height = 1080;

      const variants = await processImageToVariants({
        file,
        maxResolution: { width: 1920, height: 1080 },
        quality: 0.9,
      });

      expect(variants).toHaveLength(4);
      expect(variants[0].width).toBeLessThanOrEqual(1920);
      expect(variants[0].height).toBeLessThanOrEqual(1080);
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.9,
      );
    });

    it('should handle image that needs downscaling', async () => {
      const file = makeFile(1024 * 1024, 'image/jpeg');
      mockImage.width = 3840;
      mockImage.height = 2160;
      mockCanvas.width = 3840;
      mockCanvas.height = 2160;

      const variants = await processImageToVariants({
        file,
        maxResolution: { width: 3840, height: 2160 },
      });

      expect(variants).toHaveLength(4);
      expect(variants[0].width).toBeLessThanOrEqual(3840);
      expect(variants[0].height).toBeLessThanOrEqual(2160);
    });

    it.each([
      ['both dimensions', 5000, 3000],
      ['width only', 4000, 2000],
      ['height only', 3000, 2500],
    ])(
      'should automatically downscale when image %s exceed maxResolution',
      async (_, width, height) => {
        const file = makeFile(1024 * 1024, 'image/jpeg');
        mockImage.width = width;
        mockImage.height = height;

        const variants = await processImageToVariants({
          file,
          maxResolution: { width: 3840, height: 2160 },
        });

        // Should successfully process with downscaling
        expect(variants).toHaveLength(4);
        expect(variants[0].width).toBeLessThanOrEqual(3840);
        expect(variants[0].height).toBeLessThanOrEqual(2160);
      },
    );

    it.each([
      ['processOriginal', 5000, 3000, 1, { width: 5000, height: 3000 }],
      ['processThumbnail', 1920, 1080, 3, undefined],
    ])(
      'should handle canvas context failure in %s',
      async (_, width, height, failAfterCallCount, maxResolution) => {
        const file = makeFile(1024 * 1024, 'image/jpeg');
        mockImage.width = width;
        mockImage.height = height;
        let callCount = 0;
        mockCanvas.getContext = vi.fn(() => {
          callCount++;
          if (callCount > failAfterCallCount) {
            return null;
          }
          return mockContext;
        });

        await expect(
          processImageToVariants({
            file,
            ...(maxResolution ? { maxResolution } : {}),
          }),
        ).rejects.toThrow('Failed to process image');
      },
    );
  });
});
