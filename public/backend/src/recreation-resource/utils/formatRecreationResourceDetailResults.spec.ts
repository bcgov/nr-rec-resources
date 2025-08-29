import { formatRecreationResourceDetailResults } from 'src/recreation-resource/utils/formatRecreationResourceDetailResults';

export const mockResponse = {
  rec_resource_id: 'REC203239',
  name: '10 K SNOWMOBILE PARKING LOT',
  closest_community: 'MERRITT',
  display_on_public_site: true,
  maintenance_standard_code: 'M',
  recreation_site_description: {
    description: 'Test description',
  },
  recreation_driving_direction: {
    description: 'Test driving direction',
  },
  recreation_resource_type_view: [
    {
      description: 'Recreation Site',
      rec_resource_type_code: 'RS',
    },
  ],
  recreation_access: [],
  recreation_activity: [
    {
      recreation_activity: {
        recreation_activity_code: 22,
        description: 'Snowmobiling',
        updated_at: new Date(),
      },
    },
  ],
  recreation_status: {
    recreation_status_code: { description: 'Closed' },
    comment: 'Closed status for REC203239',
    status_code: 2,
  },
  recreation_fee: [
    {
      fee_amount: 8,
      fee_start_date: new Date(),
      fee_end_date: new Date(),
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'N',
      sunday_ind: 'N',
      recreation_fee_code: 'P',
      with_description: { description: 'Fee description' },
    },
    {
      fee_amount: 7,
      fee_start_date: new Date(),
      fee_end_date: new Date(),
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'N',
      sunday_ind: 'N',
      recreation_fee_code: 'C',
      with_description: { description: 'Fee description' },
    },
  ],
  recreation_resource_images: [] as any,
  recreation_structure: [],
  recreation_resource_docs: [
    {
      doc_code: 'RM',
      url: '/filestore/0/6/5/1/1_e6add31b6192a01/11560_d8bbba4218445a6.pdf',
      title: 'French Creek Map',
      ref_id: '11560',
      extension: 'pdf',
      recreation_resource_doc_code: {} as any,
    },
  ],
  _count: {
    recreation_defined_campsite: 1,
  },
  recreation_district_code: {
    district_code: 'MERRITT',
    description: 'Merritt',
  },
  recreation_resource_reservation_info: {
    reservation_instructions: "All reservations through partner, not RSTBC",
    reservation_website: "https://accwhistler.ca/WendyThompson.html",
    reservation_phone_number: "1-999-999-9999",
    reservation_email: "email@email.com",
    reservation_comments: "this is a huge comment",
  },
  recreation_resource_reservation_info: {
    reservation_instructions: "All reservations through partner, not RSTBC",
    reservation_website: "https://accwhistler.ca/WendyThompson.html",
    reservation_phone_number: "1-999-999-9999",
    reservation_email: "email@email.com",
    reservation_comments: "this is a huge comment",
  },
};

export const mockSpatialResponse = [
  {
    spatial_feature_geometry: ['{"type":"Polygon","coordinates":"test"}'],
    site_point_geometry: 'Point',
  } as any,
];

export const mockResults = {
  additional_fees: [
    {
      fee_amount: 8,
      fee_end_date: expect.any(Date),
      fee_start_date: expect.any(Date),
      friday_ind: 'Y',
      monday_ind: 'Y',
      recreation_fee_code: 'P',
      saturday_ind: 'N',
      sunday_ind: 'N',
      thursday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
    },
  ],
  closest_community: 'MERRITT',
  description: 'Test description',
  driving_directions: 'Test driving direction',
  maintenance_standard_code: 'M',
  name: '10 K SNOWMOBILE PARKING LOT',
  rec_resource_id: 'REC203239',
  rec_resource_type: 'Recreation Site',
  recreation_access: [],
  recreation_activity: [
    {
      description: 'Snowmobiling',
      recreation_activity_code: 22,
    },
  ],
  recreation_fee: [
    {
      fee_amount: 7,
      fee_start_date: expect.any(Date),
      fee_end_date: expect.any(Date),
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'N',
      sunday_ind: 'N',
      recreation_fee_code: 'C',
      fee_description: 'Fee description',
    },
  ],
  campsite_count: 1,
  recreation_resource_docs: [
    {
      doc_code: 'RM',
      doc_code_description: undefined,
      extension: 'pdf',
      recreation_resource_doc_code: {},
      ref_id: '11560',
      title: 'French Creek Map',
      url: '/filestore/0/6/5/1/1_e6add31b6192a01/11560_d8bbba4218445a6.pdf',
    },
  ],
  recreation_resource_images: [],
  recreation_status: {
    comment: 'Closed status for REC203239',
    description: 'Closed',
    status_code: 2,
  },
  recreation_structure: {
    has_table: false,
    has_toilet: false,
  },
  site_point_geometry: 'Point',
  spatial_feature_geometry: ['{"type":"Polygon","coordinates":"test"}'],
  recreation_district: {
    description: 'Merritt',
    district_code: 'MERRITT',
  },
  recreation_resource_reservation_info: {
    reservation_instructions: "All reservations through partner, not RSTBC",
    reservation_website: "https://accwhistler.ca/WendyThompson.html",
    reservation_phone_number: "1-999-999-9999",
    reservation_email: "email@email.com",
    reservation_comments: "this is a huge comment",
  },
  recreation_resource_reservation_info: {
    reservation_instructions: "All reservations through partner, not RSTBC",
    reservation_website: "https://accwhistler.ca/WendyThompson.html",
    reservation_phone_number: "1-999-999-9999",
    reservation_email: "email@email.com",
    reservation_comments: "this is a huge comment",
  },
};

describe('formatRecreationResourceDetailResults function', () => {
  it('should correctly format the results', () => {
    const results = formatRecreationResourceDetailResults(
      mockResponse,
      mockSpatialResponse,
    );
    expect(results).toEqual(mockResults);
  });

  it('should correctly format the results with toilet and table structures', () => {
    const mockResponseCopy = {
      ...mockResponse,
      recreation_structure: [
        { recreation_structure_code: { description: 'Table - log' } },
        { recreation_structure_code: { description: 'Toilet - log' } },
      ],
    };
    const mockResultsCopy = {
      ...mockResults,
      recreation_structure: {
        has_table: true,
        has_toilet: true,
      },
    };
    const results = formatRecreationResourceDetailResults(
      mockResponseCopy,
      mockSpatialResponse,
    );
    expect(results).toEqual(mockResultsCopy);
  });

  it('should throw an error with garbage data', () => {
    expect(() => formatRecreationResourceDetailResults({} as any, [])).toThrow(
      "Cannot read properties of undefined (reading 'map')",
    );
  });

  it("should return result with status as 'Open' if no status is provided", () => {
    const results = formatRecreationResourceDetailResults(
      { ...mockResponse, recreation_status: null },
      mockSpatialResponse,
    );

    expect(results.recreation_status).toEqual({
      comment: undefined,
      description: 'Open',
      status_code: 1,
    });
  });

  it('should set recreation_district field to undefined when recreation_district_code is missing', () => {
    const mockResponseNoDistrict = {
      ...mockResponse,
      recreation_district_code: undefined,
    };
    const results = formatRecreationResourceDetailResults(
      mockResponseNoDistrict,
      mockSpatialResponse,
    );
    expect(results.recreation_district).toBeUndefined();
  });
});
