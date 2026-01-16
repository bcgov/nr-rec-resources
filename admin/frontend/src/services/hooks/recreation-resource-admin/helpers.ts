import {
  RecreationFeeDto,
  RecreationFeeUIModel,
  RecreationResourceDetailDto,
  RecreationResourceDetailUIModel,
} from '@/services';
import { formatDateReadable } from '@shared/index';

/**
 * Maps a RecreationResourceDetailDto to RecreationResourceDetail with additional derived descriptions.
 * @param data The original RecreationResourceDetailDto object
 * @returns RecreationResourceDetail with mapped descriptions
 */
export function mapRecreationResourceDetail(
  data: RecreationResourceDetailDto,
): RecreationResourceDetailUIModel {
  // Note: maintenance_standard is currently typed as an enum in the generated client
  // but the API actually returns an object with maintenance_standard_code and description
  const maintenanceStandard = data.maintenance_standard as any;

  return {
    ...data,
    maintenance_standard_code:
      typeof maintenanceStandard === 'object'
        ? maintenanceStandard?.maintenance_standard_code
        : undefined,
    maintenance_standard_description:
      typeof maintenanceStandard === 'object'
        ? maintenanceStandard?.description
        : undefined,
    recreation_district_description: data.recreation_district?.description,
    recreation_status_code: data.recreation_status?.status_code,
    recreation_status_description: data.recreation_status?.description,
    control_access_code:
      data.recreation_control_access_code?.recreation_control_access_code,
    control_access_code_description:
      data.recreation_control_access_code?.description,
    project_established_date_readable_utc: formatDateReadable(
      data.project_established_date,
      {
        timeZone: 'UTC', // this date is stored in PST timezone in database
      },
    ),
    risk_rating_code: data.risk_rating?.risk_rating_code,
    risk_rating_description: data.risk_rating?.description,
  };
}

/**
 * Maps a RecreationFeeDto to RecreationFeeUIModel with readable date fields.
 * @param fee The original RecreationFeeDto object
 * @returns RecreationFeeUIModel with readable UTC date fields
 */
export function mapRecreationFee(fee: RecreationFeeDto): RecreationFeeUIModel {
  return {
    ...fee,
    fee_start_date_readable_utc: formatDateReadable(fee.fee_start_date, {
      timeZone: 'UTC',
    }),
    fee_end_date_readable_utc: formatDateReadable(fee.fee_end_date, {
      timeZone: 'UTC',
    }),
  };
}

/**
 * Returns a retry handler function for React Query hooks.
 * @param options Optional config: maxRetries, onFail callback
 * @returns (retryCount, error) => boolean
 */
export function createRetryHandler({
  maxRetries = 2,
  onFail,
}: {
  maxRetries?: number;
  onFail?: (error: unknown) => void;
} = {}) {
  return (retryCount: number, error: unknown) => {
    if (retryCount >= maxRetries) {
      if (onFail) onFail(error);
      return false;
    }
    const status =
      (error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as any).response?.status) ||
      undefined;
    return typeof status === 'number' && status >= 500 && status < 600;
  };
}
