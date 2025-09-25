import { DamMetadataDto } from '@/dam-api/dto/dam-metadata.dto';
import { describe, it, expect } from 'vitest';

describe('RecreationResourceDocDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new DamMetadataDto();
    dto.title = 'title';
    dto.closestCommunity = 'Closest community';
    dto.recreationName = 'Recreation name';
    dto.recreationDistrict = 'Rec District';

    expect(dto).toBeDefined();
    expect(dto.title).toBe('title');
    expect(dto.closestCommunity).toBe('Closest community');
    expect(dto.recreationName).toBe('Recreation name');
    expect(dto.recreationDistrict).toBe('Rec District');
  });

  it('should allow the properties to be undefined', () => {
    const dto = new DamMetadataDto();

    expect(dto).toBeDefined();
    expect(dto.title).toBeUndefined();
    expect(dto.closestCommunity).toBeUndefined();
    expect(dto.recreationName).toBeUndefined();
    expect(dto.recreationDistrict).toBeUndefined();
  });
});
