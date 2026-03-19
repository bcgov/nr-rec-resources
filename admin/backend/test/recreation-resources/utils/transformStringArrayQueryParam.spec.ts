import { transformStringArrayQueryParam } from '@/recreation-resources/utils/transformStringArrayQueryParam';
import { describe, expect, it } from 'vitest';

describe('transformStringArrayQueryParam', () => {
  it('splits underscore-delimited string values and trims tokens', () => {
    expect(
      transformStringArrayQueryParam({
        value: ' SIT _ RTR __ DAY ',
      }),
    ).toEqual(['SIT', 'RTR', 'DAY']);
  });

  it('flattens array values and ignores non-string entries', () => {
    expect(
      transformStringArrayQueryParam({
        value: ['SIT_RTR', 1, ' DAY ', null],
      }),
    ).toEqual(['SIT', 'RTR', 'DAY']);
  });

  it('returns undefined for unsupported query param types', () => {
    expect(transformStringArrayQueryParam({ value: 123 })).toBeUndefined();
    expect(transformStringArrayQueryParam({ value: { type: 'SIT' } })).toBe(
      undefined,
    );
  });
});
