import { describe, it, expect } from 'vitest';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

describe('capitalizeWords', () => {
  it('capitalizes each word in a lowercase string', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
  });

  it('capitalizes each word in a mixed-case string', () => {
    expect(capitalizeWords('hElLo WoRLd')).toBe('Hello World');
  });

  it('handles single-word input', () => {
    expect(capitalizeWords('test')).toBe('Test');
  });

  it('returns an empty string if input is empty', () => {
    expect(capitalizeWords('')).toBe('');
  });

  it('handles strings with punctuation', () => {
    expect(capitalizeWords('hello, world!')).toBe('Hello, World!');
  });
});
