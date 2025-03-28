import { formatRecreationResourceDetailResults } from "src/recreation-resource/utils/formatRecreationResourceDetailResults";

const response = {
  rec_resource_id: "REC203239",
  description: "test",
  name: "10 K SNOWMOBILE PARKING LOT",
  closest_community: "MERRITT",
  display_on_public_site: true,
  recreation_map_feature: [
    {
      recreation_resource_type_code: {
        description: "Recreation Site",
        rec_resource_type_code: "RS",
      },
    },
  ],
  recreation_access: [],
  recreation_activity: [],
  recreation_campsite: {
    rec_resource_id: "REC203239",
    campsite_count: 1,
    updated_at: new Date(),
    updated_by: "test_user",
    created_at: new Date(),
    created_by: "test_user",
  },
  recreation_status: {
    recreation_status_code: { description: "Closed" },
    comment: "Closed status for REC203239",
    status_code: 2,
  },
  recreation_fee: [
    {
      fee_amount: 8,
      fee_start_date: new Date(),
      fee_end_date: new Date(),
      monday_ind: "Y",
      tuesday_ind: "Y",
      wednesday_ind: "Y",
      thursday_ind: "Y",
      friday_ind: "Y",
      saturday_ind: "N",
      sunday_ind: "N",
      recreation_fee_code: "P",
      with_description: { description: "Fee description" },
    },
  ],
  recreation_resource_images: [] as any,
  recreation_structure: [],
  recreation_resource_docs: [
    {
      doc_code: "RM",
      url: "/filestore/0/6/5/1/1_e6add31b6192a01/11560_d8bbba4218445a6.pdf",
      title: "French Creek Map",
      ref_id: "11560",
      extension: "pdf",
      recreation_resource_doc_code: {} as any,
    },
  ],
};

const spatialResponse = [
  {
    spatial_feature_geometry: ['{"type":"Polygon","coordinates":"test"}'],
    site_point_geometry: "Point",
  } as any,
];

describe("formatRecreationResourceDetailResults function", () => {
  it("should correctly format the results", () => {
    const results = formatRecreationResourceDetailResults(
      response,
      spatialResponse,
    );

    expect(results).toEqual({
      additional_fees: [
        {
          fee_amount: 8,
          fee_end_date: expect.any(Date),
          fee_start_date: expect.any(Date),
          friday_ind: "Y",
          monday_ind: "Y",
          recreation_fee_code: "P",
          saturday_ind: "N",
          sunday_ind: "N",
          thursday_ind: "Y",
          tuesday_ind: "Y",
          wednesday_ind: "Y",
        },
      ],
      closest_community: "MERRITT",
      description: "test",
      display_on_public_site: true,
      name: "10 K SNOWMOBILE PARKING LOT",
      rec_resource_id: "REC203239",
      rec_resource_type: "Recreation Site",
      recreation_access: [],
      recreation_activity: [],
      recreation_campsite: {
        campsite_count: 1,
        created_at: expect.any(Date),
        created_by: "test_user",
        rec_resource_id: "REC203239",
        updated_at: expect.any(Date),
        updated_by: "test_user",
      },
      recreation_fee: [],
      recreation_map_feature: [
        {
          recreation_resource_type_code: {
            description: "Recreation Site",
            rec_resource_type_code: "RS",
          },
        },
      ],
      recreation_resource_docs: [
        {
          doc_code: "RM",
          doc_code_description: undefined,
          extension: "pdf",
          recreation_resource_doc_code: {},
          ref_id: "11560",
          title: "French Creek Map",
          url: "/filestore/0/6/5/1/1_e6add31b6192a01/11560_d8bbba4218445a6.pdf",
        },
      ],
      recreation_resource_images: [],
      recreation_status: {
        comment: "Closed status for REC203239",
        description: "Closed",
        status_code: 2,
      },
      recreation_structure: {
        has_table: false,
        has_toilet: false,
      },
      spatial_feature_geometry: ['{"type":"Polygon","coordinates":"test"}'],
      site_point_geometry: "Point",
    });
  });

  it("should throw an error with garbage data", () => {
    expect(() => formatRecreationResourceDetailResults({} as any, [])).toThrow(
      "Cannot read properties of undefined (reading 'map')",
    );
  });
});
