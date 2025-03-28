import { FilterDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";
import {
  CombinedRecordCount,
  CombinedStaticCount,
} from "src/recreation-resource/service/types";

// Build the filter menu based on the combined record and static counts
export const buildFilterMenu = ({
  combinedRecordCounts,
  combinedStaticCounts,
}: {
  combinedRecordCounts: CombinedRecordCount[];
  combinedStaticCounts: CombinedStaticCount[];
}) => {
  const toiletCount = combinedRecordCounts[0]?.total_toilet_count ?? 0;
  const tableCount = combinedRecordCounts[0]?.total_table_count ?? 0;

  const activityFilters = combinedRecordCounts.map((activity) => ({
    id: activity.recreation_activity_code.toString(),
    description: activity.description,
    count: Number(activity.recreation_activity_count ?? 0),
  }));

  const recreationDistrictFilters = combinedStaticCounts
    .filter((count) => count.type === "district")
    .map((district) => ({
      id: district.code,
      description: district.description,
      count: district.count ?? 0,
    }));

  const recreationAccessFilters = combinedStaticCounts
    .filter((count) => count.type === "access")
    .map((access) => ({
      id: access.code,
      description: `${access.description} access`,
      count: access.count ?? 0,
    }));

  const recResourceTypeFilters = combinedStaticCounts
    .filter((count) => count.type === "type")
    .map((resourceType) => ({
      id: resourceType.code,
      description: resourceType.description,
      count: resourceType.count ?? 0,
    }))
    .reverse();

  const filterMenu: FilterDto[] = [
    {
      type: "multi-select",
      label: "District",
      param: "district",
      options: recreationDistrictFilters,
    },
    {
      type: "multi-select",
      label: "Type",
      param: "type",
      options: recResourceTypeFilters,
    },
    {
      type: "multi-select",
      label: "Things to do",
      param: "activities",
      options: activityFilters,
    },
    {
      type: "multi-select",
      label: "Facilities",
      param: "facilities",
      options: [
        {
          id: "table",
          description: "Tables",
          count: tableCount,
        },
        {
          id: "toilet",
          description: "Toilets",
          count: toiletCount,
        },
      ],
    },
    {
      type: "multi-select",
      label: "Access Type",
      param: "access",
      options: recreationAccessFilters,
    },
  ];

  return filterMenu;
};
