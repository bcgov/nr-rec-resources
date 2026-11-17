import { describe, expect, it } from 'vitest';
import {
  EXHIBIT_A_SCALE_OPTIONS,
  EXHIBIT_A_SIZE_OPTIONS,
  resolveExhibitAUrl,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/utils/exhibitA';

describe('EditSection exhibitA utils', () => {
  it('exposes expected regenerate options', () => {
    expect(EXHIBIT_A_SIZE_OPTIONS.map((option) => option.value)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
    ]);
    expect(EXHIBIT_A_SCALE_OPTIONS).toContain(10000);
    expect(EXHIBIT_A_SCALE_OPTIONS).toContain(100000);
  });

  it('resolves URL from row when no override/docs URL is present', () => {
    const row = {
      submission_id: 'SUB-4',
      exhibit_a_url: 'https://example.com/exhibit-a.pdf',
    } as any;

    expect(resolveExhibitAUrl(row, [] as any, {})).toBe(
      'https://example.com/exhibit-a.pdf',
    );
  });
});
