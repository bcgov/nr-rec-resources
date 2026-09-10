import { parseNumber } from '@/utils/assetForm';
import type { AssetEditFormValues } from './AssetCardEdit';

export function buildAssetUpdateDto(values: AssetEditFormValues) {
  const latitude = parseNumber(values.latitude);
  const longitude = parseNumber(values.longitude);
  const hasCoordinates = latitude !== null && longitude !== null;

  return {
    asset_comment: values.asset_comment || null,
    asset_length: parseNumber(values.asset_length) ?? undefined,
    asset_width: parseNumber(values.asset_width) ?? undefined,
    asset_area: parseNumber(values.asset_area) ?? undefined,
    actual_value: parseNumber(values.actual_value) ?? undefined,
    latitude,
    longitude,
    geometry_type_code: hasCoordinates ? 'PT' : null,
  };
}

export function buildInspectionDatesDto(
  inspectionDate: string,
  dangerTreeDate: string,
) {
  return {
    last_rec_inspection_date: inspectionDate || null,
    last_hzrd_tree_assess_date: dangerTreeDate || null,
  };
}
