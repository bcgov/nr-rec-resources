import { z } from 'zod';
import {
  DEFAULT_ADMIN_SEARCH_STATE,
  type AdminSearchColumnId,
} from '@/pages/search/constants';
import { AdminSearchRouteState, AdminSearchSort } from '@/pages/search/types';
import {
  SerializedAdminSearchRouteState,
  serializeAdminSearchRouteState,
} from '@/pages/search/utils/urlState';

const sortSchema = z.enum([
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
] satisfies AdminSearchSort[]);

const definedCampsitesSchema = z.enum(['yes', 'no']);

function normalizeStringToken(value: string): string {
  return value.trim().replace(/^"(.*)"$/, '$1');
}

function getStringValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = normalizeStringToken(value);
    return trimmed ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const firstString = value.find(
      (entry): entry is string => typeof entry === 'string' && Boolean(entry),
    );
    return firstString?.trim() || undefined;
  }

  return undefined;
}

function getNumberValue(
  value: unknown,
  fallback: number,
  allowed?: number[],
): number {
  const rawValue = getStringValue(value);
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  if (allowed && !allowed.includes(parsed)) {
    return fallback;
  }

  return parsed;
}

function getTokenList(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.split(',').map(normalizeStringToken).filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => getTokenList(entry));
  }

  return [];
}

function getSearchFilterTokenList(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.split('_').map(normalizeStringToken).filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => getSearchFilterTokenList(entry));
  }

  return [];
}

function getOptionalToken(value: unknown): string | undefined {
  return getStringValue(value);
}

function getSortValue(value: unknown): AdminSearchSort | undefined {
  const token = getStringValue(value);

  if (!token) {
    return undefined;
  }

  const normalizedToken = token.includes(':')
    ? token
    : token.replace(/^(.*)_(asc|desc)$/, '$1:$2');
  const legacyAliases: Record<string, AdminSearchSort> = {
    'recreation_resource_type:asc': 'type:asc',
    'recreation_resource_type:desc': 'type:desc',
    'project_established_date:asc': 'established_date:asc',
    'project_established_date:desc': 'established_date:desc',
    'access_types:asc': 'access:asc',
    'access_types:desc': 'access:desc',
    'fee_types:asc': 'fee:asc',
    'fee_types:desc': 'fee:desc',
    'closest_community:asc': 'community:asc',
    'closest_community:desc': 'community:desc',
    'campsite_count:asc': 'campsites:asc',
    'campsite_count:desc': 'campsites:desc',
    'district_description:asc': 'district:asc',
    'district_description:desc': 'district:desc',
  };
  const canonicalToken =
    legacyAliases[normalizedToken] ?? (normalizedToken as AdminSearchSort);
  const parsedSort = sortSchema.safeParse(canonicalToken);

  return parsedSort.success ? parsedSort.data : undefined;
}

export function validateAdminSearch(
  search: Record<string, unknown>,
): SerializedAdminSearchRouteState {
  const definedCampsites = definedCampsitesSchema.safeParse(
    getOptionalToken(search.defined_campsites),
  );

  return serializeAdminSearchRouteState({
    q: getStringValue(search.q) ?? DEFAULT_ADMIN_SEARCH_STATE.q,
    sort: getSortValue(search.sort) ?? DEFAULT_ADMIN_SEARCH_STATE.sort,
    page: getNumberValue(search.page, DEFAULT_ADMIN_SEARCH_STATE.page),
    type: getSearchFilterTokenList(search.type),
    district: getSearchFilterTokenList(search.district),
    activities: getSearchFilterTokenList(search.activities),
    establishment_date_from: getOptionalToken(search.establishment_date_from),
    establishment_date_to: getOptionalToken(search.establishment_date_to),
    access: getSearchFilterTokenList(search.access),
    defined_campsites: definedCampsites.success
      ? definedCampsites.data
      : undefined,
    closest_community: getOptionalToken(search.closest_community),
  });
}

export function resolveAdminSearchRouteState(
  search: SerializedAdminSearchRouteState,
): AdminSearchRouteState {
  const searchFilterTokenList = (value: string | undefined): string[] =>
    value
      ? value
          .split('_')
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];
  const sort = getSortValue(search.sort);

  return {
    ...DEFAULT_ADMIN_SEARCH_STATE,
    ...search,
    sort: sort ?? DEFAULT_ADMIN_SEARCH_STATE.sort,
    type: searchFilterTokenList(search.type),
    district: searchFilterTokenList(search.district),
    activities: searchFilterTokenList(search.activities),
    access: searchFilterTokenList(search.access),
    defined_campsites:
      search.defined_campsites ?? DEFAULT_ADMIN_SEARCH_STATE.defined_campsites,
    closest_community:
      search.closest_community ?? DEFAULT_ADMIN_SEARCH_STATE.closest_community,
  };
}

export function coerceVisibleAdminSearchColumns(
  value: unknown,
): AdminSearchColumnId[] {
  const parsed = getTokenList(value).filter(
    (entry): entry is AdminSearchColumnId =>
      [
        'rec_resource_id',
        'name',
        'recreation_resource_type',
        'district',
        'project_established_date',
        'access_types',
        'fee_types',
        'defined_campsites',
        'closest_community',
      ].includes(entry),
  );

  return parsed.includes('rec_resource_id')
    ? parsed
    : ['rec_resource_id', ...parsed];
}
