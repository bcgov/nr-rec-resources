import {
  NOTE_TYPE_LABELS,
  getNoteTypeLabel,
} from '@/pages/rec-resource-page/components/RecResourceNotesSection/constants';
import { describe, expect, it } from 'vitest';

describe('getNoteTypeLabel', () => {
  it('maps the known codes', () => {
    expect(getNoteTypeLabel('NOTE')).toBe('Note');
    expect(getNoteTypeLabel('REFERENCE')).toBe('Reference');
    expect(getNoteTypeLabel('FILE')).toBe('Associated file');
  });

  it('falls back to Note for an unknown code', () => {
    expect(getNoteTypeLabel('SOMETHING_ELSE')).toBe('Note');
    expect(getNoteTypeLabel('')).toBe('Note');
  });

  it('exposes the label map', () => {
    expect(Object.keys(NOTE_TYPE_LABELS)).toEqual([
      'NOTE',
      'REFERENCE',
      'FILE',
    ]);
  });
});
