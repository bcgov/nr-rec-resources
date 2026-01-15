import {
  CreateRecreationResourceImageBodyDto,
  CreateRecreationResourceImageFormDto,
  CreateRecreationResourceImageVariantsDto,
  RecreationResourceImageDto,
  RecreationResourceImageSize,
  RecreationResourceImageVariantDto,
} from '@/resource-images/dto/recreation-resource-image.dto';
import { describe, expect, it } from 'vitest';

describe('RecreationResourceDocDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new RecreationResourceImageDto();
    dto.ref_id = '1000';
    dto.file_name = 'campbell-river-site-picture.webp';
    dto.recreation_resource_image_variants = [
      {
        url: '/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272_53af5f9880e0b58.webp?v=1742978093',
        extension: 'webp',
        width: 1440,
        height: 1080,
        size_code: RecreationResourceImageSize.ORIGINAL,
      },
      {
        url: '/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272hpr_50d64095d1b545b.jpg?v=1742978094',
        extension: 'jpg',
        width: 1440,
        height: 1080,
        size_code: RecreationResourceImageSize.HIGH_RES_PRINT,
      },
    ];

    expect(dto).toBeDefined();
    expect(dto.ref_id).toBe('1000');
    expect(dto.file_name).toBe('campbell-river-site-picture.webp');
    expect(dto.recreation_resource_image_variants[0]?.url).toBe(
      '/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272_53af5f9880e0b58.webp?v=1742978093',
    );
    expect(dto.recreation_resource_image_variants[0]?.extension).toBe('webp');
    expect(dto.recreation_resource_image_variants[0]?.width).toBe(1440);
    expect(dto.recreation_resource_image_variants[0]?.height).toBe(1080);
    expect(dto.recreation_resource_image_variants[0]?.size_code).toBe(
      RecreationResourceImageSize.ORIGINAL,
    );
  });

  it('should validate enum values', () => {
    expect(Object.values(RecreationResourceImageSize)).toContain('original');
    expect(Object.keys(RecreationResourceImageSize)).toHaveLength(16);
  });

  it('should handle empty values', () => {
    const dto = new RecreationResourceImageDto();
    expect(dto).toBeDefined();
    expect(dto.ref_id).toBeUndefined();
    expect(dto.file_name).toBeUndefined();
    expect(dto.recreation_resource_image_variants).toBeUndefined();
  });

  describe('RecreationResourceImageVariantDto', () => {
    it('should create a valid DTO instance', () => {
      const dto = new RecreationResourceImageVariantDto();
      dto.url =
        '/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272_53af5f9880e0b58.webp?v=1742978093';
      dto.extension = 'webp';
      dto.width = 1440;
      dto.height = 1080;
      dto.size_code = RecreationResourceImageSize.ORIGINAL;

      expect(dto).toBeDefined();
      expect(dto.url).toBe(
        '/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272_53af5f9880e0b58.webp?v=1742978093',
      );
      expect(dto.extension).toBe('webp');
      expect(dto.width).toBe(1440);
      expect(dto.height).toBe(1080);
      expect(dto.size_code).toBe(RecreationResourceImageSize.ORIGINAL);
    });
  });

  describe('CreateRecreationResourceImageBodyDto', () => {
    it('should create a valid DTO instance', () => {
      const dto = new CreateRecreationResourceImageBodyDto();
      dto.file_name = 'new-file-upload.webp';

      expect(dto).toBeDefined();
      expect(dto.file_name).toBe('new-file-upload.webp');
    });
  });

  describe('CreateRecreationResourceImageFormDto', () => {
    it('should create a valid DTO instance', () => {
      const dto = new CreateRecreationResourceImageFormDto();
      dto.file_name = 'campbell-river-site-map.webp';
      dto.file = 'file-content';

      expect(dto).toBeDefined();
      expect(dto.file_name).toBe('campbell-river-site-map.webp');
      expect(dto.file).toBe('file-content');
    });

    it('should allow file to be a Buffer', () => {
      const dto = new CreateRecreationResourceImageFormDto();
      dto.file_name = 'campbell-river-site-map.webp';
      dto.file = Buffer.from('test');
      expect(dto.file).toBeInstanceOf(Buffer);
    });

    it('should allow missing file property', () => {
      const dto = new CreateRecreationResourceImageFormDto();
      dto.file_name = 'campbell-river-site-map.webp';
      expect(dto.file_name).toBe('campbell-river-site-map.webp');
      expect(dto.file).toBeUndefined();
    });
  });

  describe('CreateRecreationResourceImageVariantsDto', () => {
    it('should create a valid DTO instance', () => {
      const dto = new CreateRecreationResourceImageVariantsDto();
      dto.file_name = 'beautiful-mountain-view.webp';

      expect(dto).toBeDefined();
      expect(dto.file_name).toBe('beautiful-mountain-view.webp');
    });
  });
});
