import { GetOptionsByTypesQueryDto } from '@/recreation-resources/options/dtos/get-options-by-types-query.dto';
import { VALID_OPTION_TYPES } from '@/recreation-resources/options/options.constants';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

describe('GetOptionsByTypesQueryDto', () => {
  it('should transform comma-separated string into array', () => {
    const input = { types: VALID_OPTION_TYPES.slice(0, 2).join(',') };

    const dto = plainToInstance(GetOptionsByTypesQueryDto, input);

    expect(Array.isArray(dto.types)).toBe(true);
    expect(dto.types).toEqual(VALID_OPTION_TYPES.slice(0, 2));
  });

  it('should accept array input as-is', () => {
    const input = { types: VALID_OPTION_TYPES.slice(0, 3) };

    const dto = plainToInstance(GetOptionsByTypesQueryDto, input);

    expect(dto.types).toEqual(VALID_OPTION_TYPES.slice(0, 3));
  });

  it('should fail validation for invalid types', () => {
    const input = { types: ['invalid'] };

    const dto = plainToInstance(GetOptionsByTypesQueryDto, input);
    const errors = validateSync(dto as any);

    expect(errors.length).toBeGreaterThan(0);
  });
});
