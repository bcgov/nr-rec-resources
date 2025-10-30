import { SuggestionsQueryDto } from '@/recreation-resources/dtos/suggestions-query.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('SuggestionsQueryDto', () => {
  it('should validate a correct alphanumeric search_term', async () => {
    const dto = new SuggestionsQueryDto();
    dto.search_term = 'abc123';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if search_term is less than 3 characters', async () => {
    const dto = new SuggestionsQueryDto();
    dto.search_term = 'ab';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0]!.constraints?.isLength).toBeDefined();
  });

  it('should fail if search_term is not alphanumeric', async () => {
    const dto = new SuggestionsQueryDto();
    dto.search_term = 'abc!';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0]!.constraints?.matches).toBeDefined();
  });
});
