export type DownloadFileKind = 'images' | 'docs' | 'exports' | 'maps';

const SITE_NAME = 'sitesandtrailsbc';

/**
 * Lowercases a value and keeps only filename-safe characters.
 * e.g. "Lake View (2)" -> "lake-view-2"
 */
export function slugifyFileNamePart(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Builds the name a file is saved as when downloaded, e.g.
 * `images.sitesandtrailsbc.REC1234.lake-view.webp`.
 * Empty parts are skipped. The rec resource id keeps its case.
 */
export function buildDownloadFileName({
  kind,
  recResourceId,
  parts = [],
  extension,
}: {
  kind: DownloadFileKind;
  recResourceId?: string | null;
  parts?: Array<string | null | undefined>;
  extension: string;
}): string {
  const ext = extension.replace(/^\./, '').toLowerCase();
  // names sometimes already end in the extension (e.g. "order.pdf")
  const extSuffix = new RegExp(`\\.${ext}$`, 'i');

  const segments = [
    kind,
    SITE_NAME,
    recResourceId?.replace(/[^A-Za-z0-9_-]/g, ''),
    ...parts.map((part) =>
      slugifyFileNamePart((part ?? '').replace(extSuffix, '')),
    ),
  ].filter(Boolean);

  return `${segments.join('.')}.${ext}`;
}
