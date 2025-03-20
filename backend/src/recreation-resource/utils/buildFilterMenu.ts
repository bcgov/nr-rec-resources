import {
  FilterDto,
  FilterOptionDto,
} from "src/recreation-resource/dto/paginated-recreation-resource.dto";

export const buildFilterMenu = ({
  recreationDistrictFilters,
  recResourceTypeFilters,
  activityFilters,
  toiletCount,
  tableCount,
  recreationAccessFilters,
}: {
  recreationDistrictFilters: FilterOptionDto[];
  recResourceTypeFilters: FilterOptionDto[];
  activityFilters: FilterOptionDto[];
  toiletCount: number;
  tableCount: number;
  recreationAccessFilters: FilterOptionDto[];
}) => {
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
          id: "toilet",
          description: "Toilets",
          count: toiletCount,
        },
        {
          id: "table",
          description: "Tables",
          count: tableCount,
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
