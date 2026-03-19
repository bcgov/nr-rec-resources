export const ADMIN_SEARCH_SORT_VALUES = [
  'name:asc',
  'name:desc',
  'rec_resource_id:asc',
  'rec_resource_id:desc',
  'type:asc',
  'type:desc',
  'established_date:asc',
  'established_date:desc',
  'activities:asc',
  'activities:desc',
  'access:asc',
  'access:desc',
  'fee:asc',
  'fee:desc',
  'community:asc',
  'community:desc',
  'campsites:asc',
  'campsites:desc',
  'district:asc',
  'district:desc',
] as const;

export type AdminSearchSort = (typeof ADMIN_SEARCH_SORT_VALUES)[number];

export const ADMIN_SEARCH_COLUMN_DEFINITIONS = [
  {
    id: 'rec_resource_id',
    label: 'Rec #',
    resultKey: 'recResourceId',
    sortKey: 'rec_resource_id',
  },
  {
    id: 'name',
    label: 'Name',
    resultKey: 'projectName',
    sortKey: 'name',
  },
  {
    id: 'recreation_resource_type',
    label: 'Type',
    resultKey: 'recreationResourceType',
    sortKey: 'type',
  },
  {
    id: 'district',
    label: 'District',
    resultKey: 'district',
    sortKey: 'district',
  },
  {
    id: 'closest_community',
    label: 'Closest community',
    resultKey: 'closestCommunity',
    sortKey: 'community',
  },
  {
    id: 'project_established_date',
    label: 'Est Date',
    resultKey: 'establishmentDate',
    sortKey: 'established_date',
  },
  {
    id: 'access_types',
    label: 'Access',
    resultKey: 'accessType',
    sortKey: 'access',
  },
  {
    id: 'fee_types',
    label: 'Fee type',
    resultKey: 'feeType',
    sortKey: 'fee',
  },
  {
    id: 'defined_campsites',
    label: 'Defined campsites',
    resultKey: 'definedCampsites',
    sortKey: 'campsites',
  },
] as const;

export type AdminSearchColumnId =
  (typeof ADMIN_SEARCH_COLUMN_DEFINITIONS)[number]['id'];

export const ADMIN_SEARCH_COLUMN_IDS = ADMIN_SEARCH_COLUMN_DEFINITIONS.map(
  ({ id }) => id,
) as AdminSearchColumnId[];

export const ADMIN_SEARCH_COLUMN_LABELS = Object.fromEntries(
  ADMIN_SEARCH_COLUMN_DEFINITIONS.map(({ id, label }) => [id, label]),
) as Record<AdminSearchColumnId, string>;

export const ADMIN_SEARCH_SORTABLE_COLUMNS = Object.fromEntries(
  ADMIN_SEARCH_COLUMN_DEFINITIONS.map(({ id, sortKey }) => [id, sortKey]),
) as Record<AdminSearchColumnId, string>;

export function isAdminSearchColumnId(
  value: string,
): value is AdminSearchColumnId {
  return ADMIN_SEARCH_COLUMN_IDS.includes(value as AdminSearchColumnId);
}

export function normalizeVisibleAdminSearchColumns(
  value: unknown,
): AdminSearchColumnId[] {
  // Normalize stored column preferences by dropping unsupported ids and
  // restore the required rec_resource_id column if it is missing.
  let tokens: string[] = [];

  if (typeof value === 'string') {
    tokens = value.split(',');
  } else if (Array.isArray(value)) {
    tokens = value.flatMap((entry) =>
      typeof entry === 'string' ? entry.split(',') : [],
    );
  }

  const parsed = tokens
    .map((entry) => entry.trim())
    .filter(isAdminSearchColumnId);

  return parsed.includes('rec_resource_id')
    ? parsed
    : ['rec_resource_id', ...parsed];
}
