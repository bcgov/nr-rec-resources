import { describe, it, expect } from 'vitest';
import { RecreationSuggestionDto } from 'src/recreation-resource/dto/recreation-resource-suggestion.dto';

describe('RecreationSuggestionDto', () => {
  it('should create a valid DTO instance with full values', () => {
    const dto = new RecreationSuggestionDto();
    dto.rec_resource_id = 'REC204117';
    dto.name = 'Blue Lake Campground';
    dto.closest_community = 'Hope';
    dto.district_description = 'Chilliwack District';
    dto.recreation_resource_type = 'Recreation site';
    dto.recreation_resource_type_code = 'SIT';
    dto.option_type = 'recreation_resource';

    expect(dto).toBeDefined();
    expect(dto.rec_resource_id).toBe('REC204117');
    expect(dto.name).toBe('Blue Lake Campground');
    expect(dto.closest_community).toBe('Hope');
    expect(dto.district_description).toBe('Chilliwack District');
    expect(dto.recreation_resource_type).toBe('Recreation site');
    expect(dto.recreation_resource_type_code).toBe('SIT');
    expect(dto.option_type).toBe('recreation_resource');
  });

  it('should allow missing optional values', () => {
    const dto = new RecreationSuggestionDto();
    dto.rec_resource_id = 'REC204118';
    dto.name = 'Green Lake';
    dto.closest_community = 'Kamloops';
    dto.district_description = 'Thompson District';
    dto.recreation_resource_type = 'Campground';
    dto.option_type = 'recreation_resource';

    expect(dto.recreation_resource_type_code).toBeUndefined();
  });

  it("should only allow 'recreation_resource' as option_type", () => {
    const dto = new RecreationSuggestionDto();
    dto.option_type = 'recreation_resource';

    expect(dto.option_type).toBe('recreation_resource');
    expect(typeof dto.option_type).toBe('string');
  });
});
