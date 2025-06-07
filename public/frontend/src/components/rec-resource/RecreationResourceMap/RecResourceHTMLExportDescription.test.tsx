import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { RecResourceHTMLExportDescription } from './RecResourceHTMLExportDescription';
import { RecreationResourceDetailModel } from '@/service/custom-models/recreation-resource';
import { getRecResourceDetailPageUrl } from '@/utils/recreationResourceUtils';

vi.mock('@/utils/recreationResourceUtils', async (importOriginal) => ({
  ...(await importOriginal()),
  getRecResourceDetailPageUrl: (id: string) =>
    `https://testhost/resource/${id}`,
}));

const baseResource: RecreationResourceDetailModel = {
  rec_resource_id: '1',
  name: 'Test Site',
  closest_community: 'Testville',
  recreation_activity: [
    { description: 'Hiking', recreation_activity_code: 20 },
    { description: 'Biking', recreation_activity_code: 19 },
  ],
  recreation_status: {} as any,
  rec_resource_type: 'SITE',
  recreation_resource_images: [
    {
      recreation_resource_image_variants: [
        { url: 'https://example.com/image.jpg' },
      ],
    },
  ] as any,
  description: 'A beautiful place for outdoor activities.',
  driving_directions: 'Take the main road and turn left.',
  maintenance_standard_code: 'M',
  campsite_count: 10,
  recreation_fee: [
    {
      recreation_fee_code: 'C',
      fee_amount: 15,
      fee_start_date: new Date('2024-05-01'),
      fee_end_date: new Date('2024-09-30'),
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    },
    {
      recreation_fee_code: 'D',
      fee_amount: 5,
      fee_start_date: new Date('2024-06-01'),
      fee_end_date: new Date('2024-08-31'),
      monday_ind: 'N',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'N',
      sunday_ind: 'N',
    },
  ] as any,
  recreation_access: ['Vehicle', 'Walk-in'],
  additional_fees: [],
  recreation_structure: {} as any,
  spatial_feature_geometry: [],
  site_point_geometry: '',
  recreation_resource_docs: [],
};

describe('RecResourceHTMLExportDescription', () => {
  it('renders all main fields and link', () => {
    const { getByText, getByAltText, getAllByAltText } = render(
      <RecResourceHTMLExportDescription recResource={baseResource} />,
    );
    // Name, description, image
    expect(getByText('Test Site')).toBeTruthy();
    expect(getByText('A beautiful place for outdoor activities.')).toBeTruthy();
    expect(getByAltText('Test Site')).toHaveAttribute(
      'src',
      'https://example.com/image.jpg',
    );
    // Access, driving directions
    expect(getByText('Access')).toBeTruthy();
    expect(getByText('Vehicle, Walk-in')).toBeTruthy();
    expect(getByText('Driving directions')).toBeTruthy();
    expect(getByText('Take the main road and turn left.')).toBeTruthy();
    // Fees
    expect(getByText('Camping Fee')).toBeTruthy();
    expect(getByText('$15.00')).toBeTruthy();
    expect(getByText('All Days')).toBeTruthy();
    expect(getByText('Day Use Fee')).toBeTruthy();
    expect(getByText('$5.00')).toBeTruthy();
    expect(getByText('Tuesday, Wednesday, Thursday, Friday')).toBeTruthy();
    // Things to do
    expect(getByText('Things to do')).toBeTruthy();
    expect(getByText('Hiking')).toBeTruthy();
    expect(getByText('Biking')).toBeTruthy();
    expect(getAllByAltText(/icon$/i).length).toBeGreaterThanOrEqual(2);
    // Link
    const link = getByText('View on Sites & Trails BC');
    expect(link).toHaveAttribute('href', getRecResourceDetailPageUrl('1'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles missing optional fields gracefully and still renders link', () => {
    const resource: RecreationResourceDetailModel = {
      ...baseResource,
      recreation_resource_images: [],
      recreation_fee: [],
      recreation_activity: [],
      recreation_access: [],
      driving_directions: '',
      description: '',
    };
    const { queryByAltText, queryByText, getByText } = render(
      <RecResourceHTMLExportDescription recResource={resource} />,
    );
    expect(queryByAltText('Test Site')).toBeNull();
    expect(queryByText('Fees:')).toBeNull();
    expect(queryByText('Things To Do')).toBeNull();
    expect(queryByText('Access:')).toBeNull();
    expect(queryByText('Driving directions:')).toBeNull();
    expect(queryByText('Description:')).toBeNull();
    // Link should still be present
    const link = getByText('View on Sites & Trails BC');
    expect(link).toHaveAttribute('href', getRecResourceDetailPageUrl('1'));
  });

  it('renders correctly with only required fields and link', () => {
    const minimalResource: RecreationResourceDetailModel = {
      rec_resource_id: '2',
      name: 'Minimal Site',
      closest_community: '',
      recreation_activity: [],
      recreation_status: {} as any,
      rec_resource_type: '',
      description: '',
      driving_directions: '',
      maintenance_standard_code: 'U',
      campsite_count: 0,
      recreation_fee: [],
      recreation_access: [],
      additional_fees: [],
      recreation_structure: {} as any,
      spatial_feature_geometry: [],
      site_point_geometry: '',
      recreation_resource_docs: [],
    };
    const { getByText } = render(
      <RecResourceHTMLExportDescription recResource={minimalResource} />,
    );
    expect(getByText('Minimal Site')).toBeTruthy();
    const link = getByText('View on Sites & Trails BC');
    expect(link).toHaveAttribute('href', getRecResourceDetailPageUrl('2'));
  });

  it('renders no image if image variants is empty or undefined', () => {
    const resourceEmpty: RecreationResourceDetailModel = {
      ...baseResource,
      recreation_resource_images: [
        { recreation_resource_image_variants: [] },
      ] as any,
    };
    const resourceUndef: RecreationResourceDetailModel = {
      ...baseResource,
      recreation_resource_images: [{}] as any,
    };
    expect(
      render(
        <RecResourceHTMLExportDescription recResource={resourceEmpty} />,
      ).queryByAltText('Test Site'),
    ).toBeNull();
    expect(
      render(
        <RecResourceHTMLExportDescription recResource={resourceUndef} />,
      ).queryByAltText('Test Site'),
    ).toBeNull();
  });
});
