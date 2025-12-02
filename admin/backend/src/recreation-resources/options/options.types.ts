import { OptionDto } from './dtos/option.dto';

/**
 * Middleware function for transforming database records.
 * Receives mapped OptionDto[] and raw records, returns transformed OptionDto[].
 */
export type OptionTransformMiddleware = (
  mapped: OptionDto[],
  raw: any[],
) => OptionDto[];

/**
 * Valid option type keys.
 */
export const OPTION_TYPES = {
  ACTIVITIES: 'activities',
  ACCESS: 'access',
  SUB_ACCESS: 'sub-access',
  MAINTENANCE: 'maintenance',
  RESOURCE_TYPE: 'resourceType',
  FEE_TYPE: 'feeType',
  RECREATION_STATUS: 'recreationStatus',
  STRUCTURE: 'structure',
  CONTROL_ACCESS_CODE: 'controlAccessCode',
  RISK_RATING_CODE: 'riskRatingCode',
  DISTRICT: 'district',
} as const;

/**
 * Valid option type values.
 */
export type OptionType = (typeof OPTION_TYPES)[keyof typeof OPTION_TYPES];

/**
 * Configuration for mapping database records to OptionDto.
 */
export interface TableMapping {
  /** Database field name for the option ID. */
  idField: string;

  /** Database field name for the option label/description. */
  labelField: string;

  /** Optional database field name indicating if option is archived. */
  archivedField?: string;

  /** Prisma model name to query. */
  prismaModel: string;

  /** Optional middleware function(s) for custom transformations. */
  middleware?: OptionTransformMiddleware | OptionTransformMiddleware[];

  /** Optional additional database fields to include in select query. */
  additionalFields?: string[];
}
