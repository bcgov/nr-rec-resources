import { OptionsByTypeDto } from '@/recreation-resources/options/dtos/options-by-type.dto';
import { VALID_OPTION_TYPES } from '@/recreation-resources/options/options.constants';

describe('OptionsByTypeDto', () => {
  it('should have expected properties', () => {
    const dto = new OptionsByTypeDto();
    dto.type = VALID_OPTION_TYPES[0] as any;
    dto.options = [] as any;

    expect(dto.type).toBe(VALID_OPTION_TYPES[0]);
    expect(Array.isArray(dto.options)).toBe(true);
  });
});
