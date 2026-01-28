import { describe, expect, it } from 'vitest';
import { RecreationResourceDocDto } from '../../../src/resource-docs/dto/recreation-resource-doc.dto';

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
