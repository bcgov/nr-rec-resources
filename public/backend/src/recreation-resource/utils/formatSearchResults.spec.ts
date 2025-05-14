import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";

const response = [
  {
    rec_resource_id: "REC160773",
    name: "10K CABIN",
    closest_community: "MERRITT",
    display_on_public_site: true,
    recreation_resource_type: "Recreation Reserve",
    recreation_resource_type_code: "RR",
    recreation_activity: [],
    recreation_status: {
      comment: "Open status for REC160773",
      description: "Open",
      status_code: 1,
    },
    recreation_resource_images: [],
    district_code: "RDKA",
    district_description: "Kamloops",
    access_code: "T",
    access_description: "Trail",
    recreation_structure: [],
    has_toilets: true,
    has_tables: false,
  },
];

describe("formatSearchResults function", () => {
  it("should correctly format the results", () => {
    const results = formatSearchResults(response);

    expect(results).toEqual([
      {
        rec_resource_id: "REC160773",
        name: "10K CABIN",
        closest_community: "MERRITT",
        rec_resource_type: "Recreation Reserve",
        recreation_activity: [],
        recreation_status: {
          comment: "Open status for REC160773",
          description: "Open",
          status_code: 1,
        },
        recreation_resource_images: [],
      },
    ]);
  });

  it("should return an empty array if no Recreation Resources are found", () => {
    const results = formatSearchResults([]);

    expect(results).toEqual([]);
  });

  it("should throw an error with garbage data", () => {
    expect(() => formatSearchResults({} as any)).toThrow(
      "recResources?.map is not a function",
    );
  });

  it("should return sites with status as 'Open' if no status is provided", () => {
    const results = formatSearchResults([
      { ...response[0], recreation_status: null },
    ]);

    expect(results[0].recreation_status).toEqual({
      comment: undefined,
      description: "Open",
      status_code: 1,
    });
  });
});
