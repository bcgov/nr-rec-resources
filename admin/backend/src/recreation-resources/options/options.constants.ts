import { mapAccessOptions } from './options.mapper';
import { OPTION_TYPES, OptionType, TableMapping } from './options.types';

export { OPTION_TYPES };

export const OPTION_TABLE_MAPPINGS: Record<OptionType, TableMapping> = {
  [OPTION_TYPES.ACTIVITIES]: {
    idField: 'recreation_activity_code',
    labelField: 'description',
    prismaModel: 'recreation_activity_code',
  },
  [OPTION_TYPES.ACCESS]: {
    idField: 'access_code',
    labelField: 'access_code_description',
    prismaModel: 'recreation_access_and_sub_access_code',
    middleware: mapAccessOptions,
    additionalFields: ['sub_access_code', 'sub_access_code_description'],
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
  [OPTION_TYPES.DISTRICT]: {
    idField: 'district_code',
    labelField: 'description',
    prismaModel: 'recreation_district_code',
    archivedField: 'is_archived',
  },
};

export const VALID_OPTION_TYPES = Object.values(OPTION_TYPES);
