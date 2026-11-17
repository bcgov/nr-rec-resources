import type { ExhibitADocDto } from '@/services/recreation-resource-admin';
import type { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin/models/PendingMapFeatureRequestRowDto';

export type ExhibitAPageSize = 'A' | 'B' | 'C' | 'D' | 'E';
export type ExhibitAPageOrientation = 'L' | 'P';
export type ExhibitAScale =
  | 5000
  | 10000
  | 15000
  | 20000
  | 30000
  | 50000
  | 75000
  | 100000;

export const EXHIBIT_A_SIZE_OPTIONS: Array<{
  value: ExhibitAPageSize;
  label: string;
}> = [
  { value: 'A', label: 'A – ANSI (8.5 x 11)' },
  { value: 'B', label: 'B – ANSI (11 x 17)' },
  { value: 'C', label: 'C – ANSI (17 x 22)' },
  { value: 'D', label: 'D – ANSI (22 x 34)' },
  { value: 'E', label: 'E – ANSI (34 x 44)' },
];

export const EXHIBIT_A_SCALE_OPTIONS: ExhibitAScale[] = [
  5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000,
];

export const isAbsoluteUrl = (value?: string | null): value is string =>
  !!value && /^https?:\/\//i.test(value.trim());

/**
 * Finds the Exhibit A URL for a submission row.
 * Priority: freshly uploaded/generated URL, then an exact submission match,
 * then an application-guid match, then the URL stored on the row.
 */
export const resolveExhibitAUrl = (
  row: PendingMapFeatureRequestRowDto,
  exhibitADocs: ExhibitADocDto[],
  urlOverrides: Record<string, string>,
): string | null => {
  const fromState = row.submission_id ? urlOverrides[row.submission_id] : null;

  const fromDocs =
    exhibitADocs.find((d) => {
      const submissionId =
        typeof d.submission_id === 'string' ? d.submission_id : null;
      return row.submission_id != null && submissionId === row.submission_id;
    })?.url ??
    exhibitADocs.find((d) => {
      const applicationGuid =
        typeof d.application_guid === 'string' ? d.application_guid : null;
      return (
        row.application_guid != null && applicationGuid === row.application_guid
      );
    })?.url;

  return (
    [fromState, fromDocs, row.exhibit_a_url?.trim()].find(isAbsoluteUrl) ?? null
  );
};
