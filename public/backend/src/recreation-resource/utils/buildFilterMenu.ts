import { AggregatedRecordCount } from "src/recreation-resource/service/types";
import {
  FilterDto,
  FilterOptionDto,
} from "../dto/paginated-recreation-resource.dto";

const FILTER_CONFIG = [
  { type: "district", label: "District", param: "district" },
  { type: "type", label: "Type", param: "type" },
  { type: "activity", label: "Things to do", param: "activities" },
  { type: "facilities", label: "Facilities", param: "facilities" },
  { type: "access", label: "Access type", param: "access" },
] as const;

/**
 * Helper function to create a filter option.
 * @param code - Unique identifier for the option
 * @param description - Display text for the option
 * @param count - Number of matching results
 */
const createFilterOption = (
  code: string,
  description: string,
  count: number,
): FilterOptionDto => ({
  id: code,
  description,
  count,
});

/**
 * Creates filter options from aggregated records.
 * @param aggregatedRecordCounts - Array of aggregated record counts
 * @param type - Filter type to extract
 * @param transform - Optional function to transform the description
 */
const createFilterOptions = (
  aggregatedRecordCounts: AggregatedRecordCount[],
  type: string,
  transform?: (description: string) => string,
): FilterOptionDto[] => {
  const filtered = aggregatedRecordCounts.filter((item) => item.type === type);
  return filtered.map((item) =>
    createFilterOption(
      item.code,
      transform ? transform(item.description) : item.description,
      item.count,
    ),
  );
};

/**
 * Creates facility filter options with predefined facilities.
 * @param aggregatedRecordCounts - Array of aggregated record counts
 */
const createFacilityOptions = (
  aggregatedRecordCounts: AggregatedRecordCount[],
): FilterOptionDto[] => {
  const facilities = aggregatedRecordCounts.filter(
    (item) => item.type === "facilities",
  );
  const getCount = (code: string) =>
    facilities.find((f) => f.code === code)?.count ?? 0;

  return [
    createFilterOption("table", "Tables", getCount("table")),
    createFilterOption("toilet", "Toilets", getCount("toilet")),
  ];
};

/**
 * Builds a filter menu based on aggregated record counts.
 * This function generates a structured filter menu for the recreation resource search interface.
 *
 * @param aggregatedRecordCounts - Array of aggregated counts for different filter categories
 */
export const buildFilterMenu = (
  aggregatedRecordCounts: AggregatedRecordCount[],
): FilterDto[] => {
  const filterOptions = {
    facilities: createFacilityOptions(aggregatedRecordCounts),
    access: createFilterOptions(
      aggregatedRecordCounts,
      "access",
      (description) => `${description} access`,
    ),
    district: createFilterOptions(aggregatedRecordCounts, "district"),
    type: createFilterOptions(aggregatedRecordCounts, "type"),
    activity: createFilterOptions(aggregatedRecordCounts, "activity"),
  };

  return FILTER_CONFIG.map(({ type, label, param }) => ({
    type: "multi-select",
    label,
    param,
    options: filterOptions[type],
  }));
};
