import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { SuggestionsQueryDto } from '@/recreation-resource/dtos/suggestions-query.dto';

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
    expect(errors[0].constraints?.isLength).toBeDefined();
  });

  it('should fail if searchTerm is not alphanumeric', async () => {
    const dto = new SuggestionsQueryDto();
    dto.searchTerm = 'abc!';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.matches).toBeDefined();
  });
});
