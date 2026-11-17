import { describe, expect, it } from 'vitest';
import {
  isAbsoluteUrl,
  resolveExhibitAUrl,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/exhibitA';

describe('exhibitA helpers', () => {
  it('detects absolute URLs', () => {
    expect(isAbsoluteUrl('https://example.com/file.pdf')).toBe(true);
    expect(isAbsoluteUrl(' HTTP://example.com/file.pdf ')).toBe(true);
    expect(isAbsoluteUrl('/relative/path.pdf')).toBe(false);
    expect(isAbsoluteUrl(undefined)).toBe(false);
  });

  it('prefers override URL over docs and row URL', () => {
    const row = {
      submission_id: 'SUB-1',
      application_guid: 'APP-1',
      exhibit_a_url: 'https://example.com/from-row.pdf',
    } as any;
    const docs = [
      { submission_id: 'SUB-1', url: 'https://example.com/from-docs.pdf' },
    ] as any;

    const resolved = resolveExhibitAUrl(row, docs, {
      'SUB-1': 'https://example.com/from-override.pdf',
    });

    expect(resolved).toBe('https://example.com/from-override.pdf');
  });

  it('falls back to application-guid document URL when submission document is missing', () => {
    const row = {
      submission_id: 'SUB-2',
      application_guid: 'APP-2',
      exhibit_a_url: 'https://example.com/from-row.pdf',
    } as any;

    const resolved = resolveExhibitAUrl(
      row,
      [
        {
          application_guid: 'APP-2',
          url: 'https://example.com/from-app-doc.pdf',
        },
      ] as any,
      {},
    );

    expect(resolved).toBe('https://example.com/from-app-doc.pdf');
  });

  it('returns null when no absolute URL is available', () => {
    const row = {
      submission_id: 'SUB-3',
      application_guid: 'APP-3',
      exhibit_a_url: '/relative-only.pdf',
    } as any;

    const resolved = resolveExhibitAUrl(row, [] as any, {});

    expect(resolved).toBeNull();
  });
});
