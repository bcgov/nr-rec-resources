import { describe, expect, it } from 'vitest';
import {
  CreateRecreationResourceDocBodyDto,
  CreateRecreationResourceDocFormDto,
  RecreationResourceDocDto,
} from '../../../src/resource-docs/dto/recreation-resource-doc.dto';

describe('RecreationResourceDocDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new RecreationResourceDocDto();
    dto.document_id = '1000';
    dto.title = 'Campbell river site map';
    dto.url = 'https://example.com/map.pdf';
    dto.rec_resource_id = 'REC0001';
    dto.created_at = '2024-01-01T00:00:00Z';

    expect(dto).toBeDefined();
    expect(dto.document_id).toBe('1000');
    expect(dto.title).toBe('Campbell river site map');
    expect(dto.url).toBe('https://example.com/map.pdf');
    expect(dto.rec_resource_id).toBe('REC0001');
    expect(dto.created_at).toBe('2024-01-01T00:00:00Z');
  });

  it('should handle empty values', () => {
    const dto = new RecreationResourceDocDto();
    expect(dto).toBeDefined();
    expect(dto.document_id).toBeUndefined();
    expect(dto.title).toBeUndefined();
    expect(dto.url).toBeUndefined();
    expect(dto.rec_resource_id).toBeUndefined();
    expect(dto.created_at).toBeUndefined();
  });

  it('should allow setting all optional and nullable fields', () => {
    const dto = new RecreationResourceDocDto();
    dto.document_id = 'doc-id';
    dto.title = null;
    dto.rec_resource_id = null;
    dto.url = undefined;
    dto.created_at = null;
    expect(dto.document_id).toBe('doc-id');
    expect(dto.title).toBeNull();
    expect(dto.rec_resource_id).toBeNull();
    expect(dto.url).toBeUndefined();
    expect(dto.created_at).toBeNull();
  });
});

describe('CreateRecreationResourceDocBodyDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = 'New File upload';

    expect(dto).toBeDefined();
    expect(dto.title).toBe('New File upload');
  });

  it('should fail validation for short title', async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = 'ab';
    expect(dto.title.length).toBeLessThan(3);
  });

  it('should fail validation for long title', async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = 'a'.repeat(101);
    expect(dto.title.length).toBeGreaterThan(100);
  });

  it('should fail validation for invalid characters', async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = 'Invalid@Title!';
    expect(/^[A-Za-z0-9-_'(). ]+$/.test(dto.title)).toBe(false);
  });

  it('should pass validation for valid title', async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = 'Valid Title 123';
    expect(/^[A-Za-z0-9-_'(). ]+$/.test(dto.title)).toBe(true);
    expect(dto.title.length).toBeGreaterThanOrEqual(3);
    expect(dto.title.length).toBeLessThanOrEqual(100);
  });
});

describe('CreateRecreationResourceDocFormDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new CreateRecreationResourceDocFormDto();
    dto.title = 'Campbell river site map';
    dto.file = 'file-content';

    expect(dto).toBeDefined();
    expect(dto.title).toBe('Campbell river site map');
    expect(dto.file).toBe('file-content');
  });

  it('should allow file to be a Buffer', () => {
    const dto = new CreateRecreationResourceDocFormDto();
    dto.title = 'Campbell river site map';
    dto.file = Buffer.from('test');
    expect(dto.file).toBeInstanceOf(Buffer);
  });

  it('should allow missing file property', () => {
    const dto = new CreateRecreationResourceDocFormDto();
    dto.title = 'Campbell river site map';
    expect(dto.title).toBe('Campbell river site map');
    expect(dto.file).toBeUndefined();
  });
});
