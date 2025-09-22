import { describe, it, expect } from 'vitest';
import { AlphabeticalRecreationResourceDto } from './alphabetical-recreation-resource.dto';

describe('AlphabeticalRecreationResourceDto', () => {
  it('should create a valid DTO instance with all required values', () => {
    const dto = new AlphabeticalRecreationResourceDto();
    dto.rec_resource_id = 'REC204117';
    dto.name = 'Blue Lake Campground';
    dto.recreation_resource_type = 'Recreation site';
    dto.recreation_resource_type_code = 'SIT';

    expect(dto).toBeDefined();
    expect(dto.rec_resource_id).toBe('REC204117');
    expect(dto.name).toBe('Blue Lake Campground');
    expect(dto.recreation_resource_type).toBe('Recreation site');
    expect(dto.recreation_resource_type_code).toBe('SIT');
  });

  it('should validate all fields are strings', () => {
    const dto = new AlphabeticalRecreationResourceDto();
    dto.rec_resource_id = 'REC111111';
    dto.name = 'Test Resource';
    dto.recreation_resource_type = 'Test Type';
    dto.recreation_resource_type_code = 'TEST';

    expect(typeof dto.rec_resource_id).toBe('string');
    expect(typeof dto.name).toBe('string');
    expect(typeof dto.recreation_resource_type).toBe('string');
    expect(typeof dto.recreation_resource_type_code).toBe('string');
  });
});
