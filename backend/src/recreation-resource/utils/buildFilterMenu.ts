import { AggregatedRecordCount } from "src/recreation-resource/service/types";
import { FilterDto } from "../dto/paginated-recreation-resource.dto";

// Build the filter menu based on the combined record and static counts
export const buildFilterMenu = ({
  combinedRecordCounts,
}: {
  combinedRecordCounts: AggregatedRecordCount[];
}): FilterDto[] => {
  const getCounts = (type: string) =>
    combinedRecordCounts.filter((item) => item.type === type);

  const toiletCount =
    getCounts("facilities").find((f) => f.code === "toilet")?.count ?? 0;
  const tableCount =
    getCounts("facilities").find((f) => f.code === "table")?.count ?? 0;

  const activityFilters = getCounts("activity").map((item) => ({
    id: item.code,
    description: item.description,
    count: item.count,
  }));

  const districtFilters = getCounts("district").map((item) => ({
    id: item.code,
    description: item.description,
    count: item.count,
  }));

  const accessFilters = getCounts("access").map((item) => ({
    id: item.code,
    description: `${item.description} access`,
    count: item.count,
  }));

  const typeFilters = getCounts("type").map((item) => ({
    id: item.code,
    description: item.description,
    count: item.count,
  }));

  return [
    {
      type: "multi-select",
      label: "District",
      param: "district",
      options: districtFilters,
    },
    {
      type: "multi-select",
      label: "Type",
      param: "type",
      options: typeFilters,
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
      label: "Access type",
      param: "access",
      options: accessFilters,
    },
  ];
};
