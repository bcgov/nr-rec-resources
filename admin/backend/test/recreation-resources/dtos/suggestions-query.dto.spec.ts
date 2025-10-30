import { SuggestionsQueryDto } from '@/recreation-resources/dtos/suggestions-query.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('SuggestionsQueryDto', () => {
  it('should validate a correct alphanumeric searchTerm', async () => {
    const dto = new SuggestionsQueryDto();
    dto.searchTerm = 'abc123';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if searchTerm is less than 3 characters', async () => {
    const dto = new SuggestionsQueryDto();
    dto.searchTerm = 'ab';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0]!.constraints?.isLength).toBeDefined();
  });

  it('should fail if searchTerm is not alphanumeric', async () => {
    const dto = new SuggestionsQueryDto();
    dto.searchTerm = 'abc!';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0]!.constraints?.matches).toBeDefined();
  });
});
