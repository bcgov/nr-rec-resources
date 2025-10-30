import {
  SuggestionDto,
  SuggestionsResponseDto,
} from '@/recreation-resources/dtos/suggestions-response.dto';
import { describe, expect, it } from 'vitest';

describe('SuggestionsResponseDto', () => {
  it('should create a valid SuggestionsResponseDto with data using constructors', () => {
    const suggestion = new SuggestionDto();
    suggestion.name = 'Test Resource';
    suggestion.rec_resource_id = 'REC123';
    suggestion.recreation_resource_type = 'RR';
    suggestion.recreation_resource_type_code = 'RR';

    const response = new SuggestionsResponseDto();
    response.total = 1;
    response.suggestions = [suggestion];

    expect(response.total).toBe(1);
    expect(response.suggestions.length).toBe(1);
    expect(response.suggestions[0]!.name).toBe('Test Resource');
    expect(response.suggestions[0]!.rec_resource_id).toBe('REC123');
    expect(response.suggestions[0]!.recreation_resource_type).toBe('RR');
    expect(response.suggestions[0]!.recreation_resource_type_code).toBe('RR');
  });

  it('should allow an empty suggestions array using constructors', () => {
    const response = new SuggestionsResponseDto();
    response.total = 0;
    response.suggestions = [];

    expect(response.total).toBe(0);
    expect(response.suggestions).toEqual([]);
  });
});
