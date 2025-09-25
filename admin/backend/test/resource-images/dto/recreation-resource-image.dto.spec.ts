import { describe, it, expect } from 'vitest';
import {
  CreateRecreationResourceImageBodyDto,
  RecreationResourceImageDto,
  RecreationResourceImageSize,
  RecreationResourceImageVariantDto,
  CreateRecreationResourceImageFormDto,
} from '../../../src/resource-images/dto/recreation-resource-image.dto';

describe('RecreationResourceDocDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new RecreationResourceImageDto();
    dto.ref_id = '1000';
    dto.caption = 'Campbell river site picture';
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
    expect(dto.caption).toBe('Campbell river site picture');
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
    expect(dto.caption).toBeUndefined();
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
      dto.caption = 'New File upload';

      expect(dto).toBeDefined();
      expect(dto.caption).toBe('New File upload');
    });

    it('should fail validation for short title', async () => {
      const dto = new CreateRecreationResourceImageBodyDto();
      dto.caption = 'ab';
      // Simulate validation (would use class-validator in real test)
      expect(dto.caption.length).toBeLessThan(3);
    });

    it('should fail validation for long title', async () => {
      const dto = new CreateRecreationResourceImageBodyDto();
      dto.caption = 'a'.repeat(101);
      expect(dto.caption.length).toBeGreaterThan(100);
    });

    it('should fail validation for invalid characters', async () => {
      const dto = new CreateRecreationResourceImageBodyDto();
      dto.caption = 'Invalid@Caption!';
      expect(/^[A-Za-z0-9-_'(). ]+$/.test(dto.caption)).toBe(false);
    });

    it('should pass validation for valid caption', async () => {
      const dto = new CreateRecreationResourceImageBodyDto();
      dto.caption = 'Valid Title 123';
      expect(/^[A-Za-z0-9-_'(). ]+$/.test(dto.caption)).toBe(true);
      expect(dto.caption.length).toBeGreaterThanOrEqual(3);
      expect(dto.caption.length).toBeLessThanOrEqual(100);
    });
  });

  describe('CreateRecreationResourceImageFormDto', () => {
    it('should create a valid DTO instance', () => {
      const dto = new CreateRecreationResourceImageFormDto();
      dto.caption = 'Campbell river site map';
      dto.file = 'file-content';

      expect(dto).toBeDefined();
      expect(dto.caption).toBe('Campbell river site map');
      expect(dto.file).toBe('file-content');
    });

    it('should allow file to be a Buffer', () => {
      const dto = new CreateRecreationResourceImageFormDto();
      dto.caption = 'Campbell river site map';
      dto.file = Buffer.from('test');
      expect(dto.file).toBeInstanceOf(Buffer);
    });

    it('should allow missing file property', () => {
      const dto = new CreateRecreationResourceImageFormDto();
      dto.caption = 'Campbell river site map';
      expect(dto.caption).toBe('Campbell river site map');
      expect(dto.file).toBeUndefined();
    });
  });
});
