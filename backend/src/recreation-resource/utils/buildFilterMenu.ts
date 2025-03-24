import { FilterDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";

export const buildFilterMenu = ({
  structureCounts,
  activityCounts,
  combinedCounts,
}) => {
  const toiletCount = structureCounts[0]?.total_toilet_count ?? 0;
  const tableCount = structureCounts[0]?.total_table_count ?? 0;

  const activityFilters = activityCounts.map((activity) => ({
    id: activity.recreation_activity_code.toString(),
    description: activity.description,
    count: Number(activity.recreation_activity_count ?? 0),
  }));

  const recreationDistrictFilters = combinedCounts
    .filter((count) => count.type === "district")
    .map((district) => ({
      id: district.code,
      description: district.description,
      count: district.count ?? 0,
    }));

  const recreationAccessFilters = combinedCounts
    .filter((count) => count.type === "access")
    .map((access) => ({
      id: access.code,
      description: `${access.description} Access`,
      count: access.count ?? 0,
    }));

  const recResourceTypeFilters = combinedCounts
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
