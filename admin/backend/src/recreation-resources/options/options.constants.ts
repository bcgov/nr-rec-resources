import { OptionDto } from '@/recreation-resources/options';
import { mapAccessOptions } from './options.mapper';

export const OPTION_TYPES = {
  ACTIVITIES: 'activities',
  REGIONS: 'regions',
  ACCESS: 'access',
  SUB_ACCESS: 'sub-access',
  MAINTENANCE: 'maintenance',
  RESOURCE_TYPE: 'resourceType',
  FEE_TYPE: 'feeType',
  RECREATION_STATUS: 'recreationStatus',
  STRUCTURE: 'structure',
  CONTROL_ACCESS_CODE: 'controlAccessCode',
  RISK_RATING_CODE: 'riskRatingCode',
} as const;

export type OptionType = (typeof OPTION_TYPES)[keyof typeof OPTION_TYPES];

export interface TableMapping {
  idField: string;
  labelField: string;
  prismaModel: string;
  reducer?: (records: any[]) => OptionDto[];
}

export const OPTION_TABLE_MAPPINGS: Record<OptionType, TableMapping> = {
  [OPTION_TYPES.ACTIVITIES]: {
    idField: 'recreation_activity_code',
    labelField: 'description',
    prismaModel: 'recreation_activity_code',
  },
  [OPTION_TYPES.REGIONS]: {
    idField: 'district_code',
    labelField: 'description',
    prismaModel: 'recreation_district_code',
  },
  [OPTION_TYPES.ACCESS]: {
    idField: 'access_code',
    labelField: 'access_code_description',
    prismaModel: 'recreation_access_and_sub_access_code',
    reducer: mapAccessOptions,
  },
  [OPTION_TYPES.SUB_ACCESS]: {
    idField: 'sub_access_code',
    labelField: 'description',
    prismaModel: 'recreation_sub_access_code',
  },
  [OPTION_TYPES.MAINTENANCE]: {
    idField: 'maintenance_standard_code',
    labelField: 'description',
    prismaModel: 'recreation_maintenance_standard_code',
  },
  [OPTION_TYPES.RESOURCE_TYPE]: {
    idField: 'rec_resource_type_code',
    labelField: 'description',
    prismaModel: 'recreation_resource_type_code',
  },
  [OPTION_TYPES.FEE_TYPE]: {
    idField: 'recreation_fee_code',
    labelField: 'description',
    prismaModel: 'recreation_fee_code',
  },
  [OPTION_TYPES.RECREATION_STATUS]: {
    idField: 'status_code',
    labelField: 'description',
    prismaModel: 'recreation_status_code',
  },
  [OPTION_TYPES.STRUCTURE]: {
    idField: 'structure_code',
    labelField: 'description',
    prismaModel: 'recreation_structure_code',
  },
  [OPTION_TYPES.CONTROL_ACCESS_CODE]: {
    idField: 'recreation_control_access_code',
    labelField: 'description',
    prismaModel: 'recreation_control_access_code',
  },
  [OPTION_TYPES.RISK_RATING_CODE]: {
    idField: 'risk_rating_code',
    labelField: 'description',
    prismaModel: 'recreation_risk_rating_code',
  },
};

export const VALID_OPTION_TYPES = Object.values(OPTION_TYPES);
