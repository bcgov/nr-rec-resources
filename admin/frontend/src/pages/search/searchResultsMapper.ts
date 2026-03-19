import { AdminSearchResultRowDto } from '@/services/recreation-resource-admin';
import type { AdminSearchResultRow } from '@/pages/search/types';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

function formatList(values?: string[] | null): string {
  return values && values.length > 0 ? values.join(', ') : '-';
}

export function mapAdminSearchResultRow(
  row: AdminSearchResultRowDto,
): AdminSearchResultRow {
  return {
    recResourceId: row.rec_resource_id,
    projectName: capitalizeWords(row.name),
    recreationResourceType: row.recreation_resource_type,
    district: row.district_description ?? '-',
    establishmentDate: row.established_date ?? '-',
    accessType: formatList(row.access_types),
    feeType: formatList(row.fee_types),
    definedCampsites: row.campsite_count > 0 ? String(row.campsite_count) : '',
    closestCommunity: row.closest_community
      ? capitalizeWords(row.closest_community)
      : '-',
  };
}
