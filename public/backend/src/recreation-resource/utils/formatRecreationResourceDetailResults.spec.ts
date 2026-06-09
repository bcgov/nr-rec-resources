import { formatRecreationResourceDetailResults } from 'src/recreation-resource/utils/formatRecreationResourceDetailResults';
import { TrailType } from '../dto/recreation-resource.dto';

export const mockResponse: any = {
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
  recreation_resource_type_view_public: [
    {
      description: 'Recreation Site',
      rec_resource_type_code: 'RS',
    },
  ],
  recreation_access: [],
  recreation_activity: [
    {
      recreation_activity: {
        description: 'Snowmobiling',
        details: null,
        is_accessible: false,
        recreation_activity_code: 22,
        updated_at: expect.any(Date),
      },
    },
    {
      recreation_activity: {
        description: 'Adaptive mountain bike trails',
        details: 'activity details',
        is_accessible: true,
        recreation_activity_code: 34,
        updated_at: expect.any(Date),
      },
    },
  ],
  recreation_activity_code_trails: [
    {
      recreation_activity_code: 34,
      trail_type: TrailType.BLUE,
      name: 'Talladega Knight',
      description: 'trail 1 details',
    },
    {
      recreation_activity_code: 34,
      trail_type: TrailType.GREEN,
      name: 'Sesame Street',
      description: 'trail 2 details',
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
      recreation_fee_sub_code: 'P',
      with_description: { description: 'Fee description' },
      recurring_ind: false,
      recurring_start_mmdd: undefined,
      recurring_end_mmdd: undefined,
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
      recreation_fee_sub_code: 'C',
      with_description: { description: 'Fee description' },
      recurring_ind: true,
      recurring_start_mmdd: '06-15',
      recurring_end_mmdd: '08-31',
    },
  ],
  recreation_resource_image: [] as any,
  recreation_structure: [],
  recreation_resource_document: [
    {
      doc_id: '11560-uuid',
      doc_code: 'RM',
      file_name: 'French Creek Map',
      extension: 'pdf',
      recreation_resource_doc_code: { description: 'Recreation Map' },
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
    reservation_website: 'https://accwhistler.ca/WendyThompson.html',
    reservation_phone_number: '1-999-999-9999',
    reservation_email: 'email@email.com',
  },
  act_advisories_flat: [
    {
      advisory_number: 1067,
      title: 'A permit is required to access this ecological reserve',
      description:
        '<div>Permits are available for research and educational activities only.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Restricted: permit required',
      access_status_grouplabel: 'Restricted',
      access_status_description:
        'A permit is required to enter this park - typically for ecological reserves only',
      event_type: 'Access restricted',
      urgency: 'High',
      advisory_status: 'Published',
      is_reservations_affected: false,
      is_advisory_date_displayed: false,
      is_effective_date_displayed: false,
      is_end_date_displayed: false,
      is_updated_date_displayed: false,
      advisory_date: '2021-07-12T06:30:41.000Z',
      effective_date: '2021-07-12T06:30:41.000Z',
      end_date: null,
      expiry_date: null,
      removal_date: null,
      updated_date: '2021-07-12T06:30:41.000Z',
      modified_date: '2025-01-08T19:28:08.000Z',
      published_at: '2025-01-08T19:28:11.000Z',
      listing_rank: 0,
      urgency_sequence: 3,
      access_status_precedence: 40,
      event_type_precedence: 172,
    },
    {
      advisory_number: 1070,
      title: 'Campground power grid upgrade delays reservation window',
      description:
        '<div>Electrical maintenance has been extended. Affected reservation holders will be contacted.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Special Note',
      access_status_grouplabel: 'Information',
      access_status_description: null,
      event_type: 'Service disruption',
      urgency: 'Medium',
      advisory_status: 'Published',
      is_reservations_affected: true,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: true,
      is_updated_date_displayed: true,
      advisory_date: '2026-05-25T09:15:00.000Z',
      effective_date: '2026-06-01T00:00:00.000Z',
      end_date: '2026-06-15T18:00:00.000Z',
      expiry_date: '2026-06-16T00:00:00.000Z',
      removal_date: null,
      updated_date: '2026-05-25T10:00:00.000Z',
      modified_date: '2026-05-25T10:00:00.000Z',
      published_at: '2026-05-25T10:02:00.000Z',
      listing_rank: 2,
      urgency_sequence: 2,
      access_status_precedence: 10,
      event_type_precedence: 120,
    },
    {
      advisory_number: 1073,
      title: 'Temporary construction noise near day use beach area',
      description:
        '<div>Heavy excavation equipment will be operating near the boat launch.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Full Access',
      access_status_grouplabel: 'Open',
      access_status_description:
        'Park facilities are running under normal conditions.',
      event_type: 'Construction',
      urgency: 'Low',
      advisory_status: 'Archived',
      is_reservations_affected: false,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: true,
      is_updated_date_displayed: true,
      advisory_date: '2026-04-01T08:00:00.000Z',
      effective_date: '2026-04-05T08:00:00.000Z',
      end_date: '2026-04-10T17:00:00.000Z',
      expiry_date: '2026-04-11T00:00:00.000Z',
      removal_date: '2026-04-11T06:00:00.000Z',
      updated_date: '2026-04-10T17:05:00.000Z',
      modified_date: '2026-04-11T06:00:00.000Z',
      published_at: '2026-04-01T08:30:00.000Z',
      listing_rank: 99,
      urgency_sequence: 1,
      access_status_precedence: 0,
      event_type_precedence: 80,
    },
    {
      advisory_number: 1076,
      title: 'Category 1 open campfire ban instituted immediately',
      description:
        '<div>Due to climbing unseasonable indices, campfires are strictly prohibited across all backcountry sites.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Fire Restructured',
      access_status_grouplabel: 'Caution',
      access_status_description:
        'Regional prohibitions or regulations have been modified.',
      event_type: 'Fire Ban',
      urgency: 'High',
      advisory_status: 'Published',
      is_reservations_affected: false,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: false,
      is_updated_date_displayed: false,
      advisory_date: '2026-06-01T12:00:00.000Z',
      effective_date: '2026-06-01T12:00:00.000Z',
      end_date: null,
      expiry_date: null,
      removal_date: null,
      updated_date: '2026-06-01T12:00:00.000Z',
      modified_date: '2026-06-01T12:00:00.000Z',
      published_at: '2026-06-01T12:01:15.000Z',
      listing_rank: 0,
      urgency_sequence: 3,
      access_status_precedence: 30,
      event_type_precedence: 200,
    },
  ],
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
      recreation_fee_sub_code: 'P',
      saturday_ind: 'N',
      sunday_ind: 'N',
      thursday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      recurring_ind: false,
      recurring_start_mmdd: undefined,
      recurring_end_mmdd: undefined,
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
      details: null,
      is_accessible: false,
      recreation_activity_code: 22,
    },
  ],
  accessible_recreation_activity: [
    {
      description: 'Adaptive mountain bike trails',
      details: 'activity details',
      is_accessible: true,
      recreation_activity_code: 34,
      recreation_activity_trails: [
        {
          trail_type: 'BLUE',
          name: 'Talladega Knight',
          description: 'trail 1 details',
        },
        {
          trail_type: 'GREEN',
          name: 'Sesame Street',
          description: 'trail 2 details',
        },
      ],
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
      recreation_fee_sub_code: 'C',
      fee_description: 'Fee description',
      recurring_ind: true,
      recurring_start_mmdd: '06-15',
      recurring_end_mmdd: '08-31',
    },
  ],
  campsite_count: 1,
  recreation_resource_docs: [
    {
      doc_id: '11560-uuid',
      file_name: 'French Creek Map',
      url: '/documents/REC203239/11560-uuid/French Creek Map.pdf',
      doc_code: 'RM',
      doc_code_description: 'Recreation Map',
      extension: 'pdf',
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
    reservation_website: 'https://accwhistler.ca/WendyThompson.html',
    reservation_phone_number: '1-999-999-9999',
    reservation_email: 'email@email.com',
  },
  advisories: [
    {
      advisory_number: 1067,
      title: 'A permit is required to access this ecological reserve',
      description:
        '<div>Permits are available for research and educational activities only.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Restricted: permit required',
      access_status_grouplabel: 'Restricted',
      access_status_description:
        'A permit is required to enter this park - typically for ecological reserves only',
      event_type: 'Access restricted',
      urgency: 'High',
      advisory_status: 'Published',
      is_reservations_affected: false,
      is_advisory_date_displayed: false,
      is_effective_date_displayed: false,
      is_end_date_displayed: false,
      is_updated_date_displayed: false,
      advisory_date: '2021-07-12T06:30:41.000Z',
      effective_date: '2021-07-12T06:30:41.000Z',
      end_date: null,
      expiry_date: null,
      removal_date: null,
      updated_date: '2021-07-12T06:30:41.000Z',
      modified_date: '2025-01-08T19:28:08.000Z',
      published_at: '2025-01-08T19:28:11.000Z',
      listing_rank: 0,
      urgency_sequence: 3,
      access_status_precedence: 40,
      event_type_precedence: 172,
    },
    {
      advisory_number: 1070,
      title: 'Campground power grid upgrade delays reservation window',
      description:
        '<div>Electrical maintenance has been extended. Affected reservation holders will be contacted.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Special Note',
      access_status_grouplabel: 'Information',
      access_status_description: null,
      event_type: 'Service disruption',
      urgency: 'Medium',
      advisory_status: 'Published',
      is_reservations_affected: true,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: true,
      is_updated_date_displayed: true,
      advisory_date: '2026-05-25T09:15:00.000Z',
      effective_date: '2026-06-01T00:00:00.000Z',
      end_date: '2026-06-15T18:00:00.000Z',
      expiry_date: '2026-06-16T00:00:00.000Z',
      removal_date: null,
      updated_date: '2026-05-25T10:00:00.000Z',
      modified_date: '2026-05-25T10:00:00.000Z',
      published_at: '2026-05-25T10:02:00.000Z',
      listing_rank: 2,
      urgency_sequence: 2,
      access_status_precedence: 10,
      event_type_precedence: 120,
    },
    {
      advisory_number: 1073,
      title: 'Temporary construction noise near day use beach area',
      description:
        '<div>Heavy excavation equipment will be operating near the boat launch.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Full Access',
      access_status_grouplabel: 'Open',
      access_status_description:
        'Park facilities are running under normal conditions.',
      event_type: 'Construction',
      urgency: 'Low',
      advisory_status: 'Archived',
      is_reservations_affected: false,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: true,
      is_updated_date_displayed: true,
      advisory_date: '2026-04-01T08:00:00.000Z',
      effective_date: '2026-04-05T08:00:00.000Z',
      end_date: '2026-04-10T17:00:00.000Z',
      expiry_date: '2026-04-11T00:00:00.000Z',
      removal_date: '2026-04-11T06:00:00.000Z',
      updated_date: '2026-04-10T17:05:00.000Z',
      modified_date: '2026-04-11T06:00:00.000Z',
      published_at: '2026-04-01T08:30:00.000Z',
      listing_rank: 99,
      urgency_sequence: 1,
      access_status_precedence: 0,
      event_type_precedence: 80,
    },
    {
      advisory_number: 1076,
      title: 'Category 1 open campfire ban instituted immediately',
      description:
        '<div>Due to climbing unseasonable indices, campfires are strictly prohibited across all backcountry sites.</div>',
      submitted_by: 'iou6ya5nwcph2mlmnq9cwi4i',
      access_status_name: 'Fire Restructured',
      access_status_grouplabel: 'Caution',
      access_status_description:
        'Regional prohibitions or regulations have been modified.',
      event_type: 'Fire Ban',
      urgency: 'High',
      advisory_status: 'Published',
      is_reservations_affected: false,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: false,
      is_updated_date_displayed: false,
      advisory_date: '2026-06-01T12:00:00.000Z',
      effective_date: '2026-06-01T12:00:00.000Z',
      end_date: null,
      expiry_date: null,
      removal_date: null,
      updated_date: '2026-06-01T12:00:00.000Z',
      modified_date: '2026-06-01T12:00:00.000Z',
      published_at: '2026-06-01T12:01:15.000Z',
      listing_rank: 0,
      urgency_sequence: 3,
      access_status_precedence: 30,
      event_type_precedence: 200,
    },
  ],
};

describe('formatRecreationResourceDetailResults function', () => {
  it('should correctly format the results', () => {
    const results = formatRecreationResourceDetailResults({
      recResource: mockResponse,
      spatialFeatureGeometry: mockSpatialResponse,
    });
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
    const results = formatRecreationResourceDetailResults({
      recResource: mockResponseCopy,
      spatialFeatureGeometry: mockSpatialResponse,
    });
    expect(results).toEqual(mockResultsCopy);
  });

  it('should throw an error with garbage data', () => {
    expect(() =>
      formatRecreationResourceDetailResults({
        recResource: {} as any,
        spatialFeatureGeometry: [],
      }),
    ).toThrow("Cannot read properties of undefined (reading 'map')");
  });

  it("should return result with status as 'Open' if no status is provided", () => {
    const results = formatRecreationResourceDetailResults({
      recResource: { ...mockResponse, recreation_status: null },
      spatialFeatureGeometry: mockSpatialResponse,
    });

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
    const results = formatRecreationResourceDetailResults({
      recResource: mockResponseNoDistrict,
      spatialFeatureGeometry: mockSpatialResponse,
    });
    expect(results.recreation_district).toBeUndefined();
  });
});
