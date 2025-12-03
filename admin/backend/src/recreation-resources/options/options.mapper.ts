import { OptionDto } from './dtos/option.dto';
import { OPTION_TABLE_MAPPINGS, OPTION_TYPES } from './options.constants';
import type { OptionTransformMiddleware } from './options.types';
import { TableMapping } from './options.types';

/**
 * Builds the select fields object for Prisma queries based on the mapping.
 * This ensures all required fields (id, label, archived, additional) are included.
 *
 * @param mapping - TableMapping configuration
 * @returns Record of field names to boolean for Prisma select
 */
export function buildSelectFields(
  mapping: TableMapping,
): Record<string, boolean> {
  const selectFields: Record<string, boolean> = {
    [mapping.idField]: true,
    [mapping.labelField]: true,
  };

  if (mapping.archivedField) {
    selectFields[mapping.archivedField] = true;
  }

  // Add additional fields required by middleware or other transformations
  if (mapping.additionalFields) {
    mapping.additionalFields.forEach((field) => {
      selectFields[field] = true;
    });
  }

  return selectFields;
}

/**
 * Standard mapping function to transform a database record to OptionDto.
 * This is the single source of truth for OptionDto creation.
 *
 * @param mapping - TableMapping configuration with field mappings
 * @param result - Raw database record
 * @returns OptionDto object
 */
export function mapResultToOptionDto(
  mapping: TableMapping,
  result: any,
): OptionDto {
  const idValue = result[mapping.idField];
  const labelValue = result[mapping.labelField];

  const option: OptionDto = {
    id: (idValue ?? '').toString(),
    label: labelValue ?? '',
  };

  if (mapping.archivedField && result[mapping.archivedField] !== undefined) {
    option.is_archived = result[mapping.archivedField];
  }

  if (result.children) {
    option.children = result.children;
  }

  return option;
}

/**
 * Builds the hierarchical structure of access and sub-access options.
 */
export const mapAccessOptions: OptionTransformMiddleware = (
  mapped: OptionDto[],
  raw: any[],
) => {
  const accessCodeMap = new Map<string, OptionDto>();

  // Use raw data to build hierarchical structure
  for (const record of raw) {
    const accessCode = record.access_code;

    // Create or get the parent access code OptionDto
    if (!accessCodeMap.has(accessCode)) {
      const parentOption = mapResultToOptionDto(
        OPTION_TABLE_MAPPINGS[OPTION_TYPES.ACCESS],
        {
          access_code: record.access_code,
          access_code_description: record.access_code_description,
        },
      );
      parentOption.children = [];
      accessCodeMap.set(accessCode, parentOption);
    }

    // Add sub-access code as a child if it exists
    if (record.sub_access_code) {
      const childOption = mapResultToOptionDto(
        OPTION_TABLE_MAPPINGS[OPTION_TYPES.SUB_ACCESS],
        {
          sub_access_code: record.sub_access_code,
          description: record.sub_access_code_description,
        },
      );
      accessCodeMap.get(accessCode)!.children!.push(childOption);
    }
  }

  return Array.from(accessCodeMap.values());
};

/**
 * Normalizes middleware to an array for consistent processing.
 */
function normalizeMiddlewares(
  middleware?: OptionTransformMiddleware | OptionTransformMiddleware[],
): OptionTransformMiddleware[] {
  if (!middleware) {
    return [];
  }
  return Array.isArray(middleware) ? middleware : [middleware];
}

/**
 * Transforms database results to OptionDto[] using a middleware pipeline.
 *
 * @param mapping - TableMapping configuration
 * @param results - Array of raw database records
 * @returns Promise resolving to array of OptionDto objects
 */
export async function transformResultsToOptionDtos(
  mapping: TableMapping,
  results: any[],
): Promise<OptionDto[]> {
  // Apply standard mapping to raw results
  const mapped = results.map((result) => mapResultToOptionDto(mapping, result));

  // Apply middleware(s) if provided
  const middlewares = normalizeMiddlewares(mapping.middleware);
  return middlewares.reduce((acc, mw) => mw(acc, results), mapped);
}
