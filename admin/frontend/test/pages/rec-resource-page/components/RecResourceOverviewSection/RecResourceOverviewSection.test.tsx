import { vi, describe, expect, it } from 'vitest';
import { RecResourceOverviewSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/RecResourceOverviewSection';
import { render, screen } from '@testing-library/react';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitySection',
  () => ({
    RecResourceActivitySection: () => <div>RecResourceActivitySection</div>,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceLocationSection',
  () => ({
    RecResourceLocationSection: () => <div>RecResourceLocationSection</div>,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceEstablishmentOrderSection',
  () => ({
    RecResourceEstablishmentOrderSection: () => (
      <div>RecResourceEstablishmentOrderSection</div>
    ),
  }),
);

describe('RecResourceOverviewSection', () => {
  const recResource = {
    description: '<b>Test Description</b>',
    closest_community: 'Test Community',
    recreation_district_description: 'Test District',
    recreation_access: [
      {
        description: 'Road',
        sub_access_code: '4W',
        sub_access_description: '4 wheel drive',
      },
      {
        description: 'Trail',
        sub_access_code: undefined,
        sub_access_description: undefined,
      },
    ],
    maintenance_standard_description: 'Test Maintenance',
    driving_directions: '<i>Test Directions</i>',
    project_established_date_readable_utc: 'June 15, 2023',
    risk_rating_description: 'High',
  } as any;

  it('renders all overview items', () => {
    render(<RecResourceOverviewSection recResource={recResource} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Closest Community')).toBeInTheDocument();
    expect(screen.getByText('Recreation District')).toBeInTheDocument();
    expect(screen.getByText('Access Type')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Type')).toBeInTheDocument();
    expect(screen.getByText('Driving Directions')).toBeInTheDocument();
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
    expect(screen.getByText('Risk Rating')).toBeInTheDocument();
    expect(screen.getByText('Test Community')).toBeInTheDocument();
    expect(screen.getByText('Test District')).toBeInTheDocument();
    expect(screen.getByText('Test Maintenance')).toBeInTheDocument();
    expect(screen.getByText('June 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    // Recreation access with sub access
    expect(screen.getByText('Road')).toBeInTheDocument();
    expect(screen.getByText('(4 wheel drive)')).toBeInTheDocument();
    expect(screen.getByText('Trail')).toBeInTheDocument();
    // HTML content
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Directions')).toBeInTheDocument();
  });

  it('renders recreation access without sub access', () => {
    const recResourceWithoutSubAccess = {
      ...recResource,
      recreation_access: [
        {
          description: 'Road',
          sub_access_code: undefined,
          sub_access_description: undefined,
        },
      ],
    } as any;

    render(
      <RecResourceOverviewSection recResource={recResourceWithoutSubAccess} />,
    );
    expect(screen.getByText('Road')).toBeInTheDocument();
    expect(screen.queryByText('(4 wheel drive)')).not.toBeInTheDocument();
  });

  it('handles empty recreation access array', () => {
    const recResourceEmptyAccess = {
      ...recResource,
      recreation_access: [],
    } as any;

    render(<RecResourceOverviewSection recResource={recResourceEmptyAccess} />);
    // With empty recreation access, the Access Type section should not be rendered
    expect(screen.queryByText('Access Type')).not.toBeInTheDocument();
  });

  it('renders project established date when present', () => {
    const recResourceWithDate = {
      ...recResource,
      project_established_date_readable_utc: 'January 10, 2020',
    } as any;

    render(<RecResourceOverviewSection recResource={recResourceWithDate} />);
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
    expect(screen.getByText('January 10, 2020')).toBeInTheDocument();
  });

  it('does not render project established date when null', () => {
    const recResourceWithNullDate = {
      ...recResource,
      project_established_date_readable_utc: null,
    } as any;

    render(
      <RecResourceOverviewSection recResource={recResourceWithNullDate} />,
    );
    expect(
      screen.queryByText('Project Established Date'),
    ).not.toBeInTheDocument();
  });

  it('does not render project established date when undefined', () => {
    const recResourceWithUndefinedDate = {
      ...recResource,
      project_established_date_readable_utc: undefined,
    } as any;

    render(
      <RecResourceOverviewSection recResource={recResourceWithUndefinedDate} />,
    );
    expect(
      screen.queryByText('Project Established Date'),
    ).not.toBeInTheDocument();
  });

  it('does not render project established date when empty string', () => {
    const recResourceWithEmptyDate = {
      ...recResource,
      project_established_date_readable_utc: '',
    } as any;

    render(
      <RecResourceOverviewSection recResource={recResourceWithEmptyDate} />,
    );
    expect(
      screen.queryByText('Project Established Date'),
    ).not.toBeInTheDocument();
  });

  it('renders project established date even when whitespace only', () => {
    const recResourceWithWhitespaceDate = {
      ...recResource,
      project_established_date_readable_utc: '   ',
    } as any;

    render(
      <RecResourceOverviewSection
        recResource={recResourceWithWhitespaceDate}
      />,
    );
    // The component checks for truthy value, so whitespace string should still render the label
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();

    // Verify that the section is rendered (even with whitespace content)
    const sections = screen.getAllByRole('region');
    const dateSection = sections.find(
      (section) =>
        section.querySelector('.text-primary')?.textContent ===
        'Project Established Date',
    );
    expect(dateSection).toBeInTheDocument();
  });

  it('renders different date formats correctly', () => {
    const testCases = [
      'December 25, 2023',
      'Jan 1, 2000',
      '2023-06-15',
      '15/06/2023',
    ];

    testCases.forEach((dateValue) => {
      const recResourceWithCustomDate = {
        ...recResource,
        project_established_date_readable_utc: dateValue,
      } as any;

      const { unmount } = render(
        <RecResourceOverviewSection recResource={recResourceWithCustomDate} />,
      );
      expect(screen.getByText('Project Established Date')).toBeInTheDocument();
      expect(screen.getByText(dateValue)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles missing optional fields gracefully', () => {
    const recResourceMinimal = {
      description: 'Test Description',
      closest_community: undefined,
      recreation_district_description: null,
      recreation_access: [],
      maintenance_standard_description: '',
      driving_directions: undefined,
      project_established_date_readable_utc: null,
      risk_rating_description: undefined,
    } as any;

    render(<RecResourceOverviewSection recResource={recResourceMinimal} />);

    // Should render the overview title and description
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();

    // Risk Rating should render with default '--' value
    expect(screen.queryByText('Risk Rating')).toBeInTheDocument();

    // Optional fields should not be rendered when empty/null/undefined
    expect(screen.queryByText('Closest Community')).not.toBeInTheDocument();
    expect(screen.queryByText('Recreation District')).not.toBeInTheDocument();
    expect(screen.queryByText('Access Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Maintenance Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Driving Directions')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Project Established Date'),
    ).not.toBeInTheDocument();
  });

  it('renders all fields when all have values', () => {
    const recResourceComplete = {
      description: 'Complete Description',
      closest_community: 'Complete Community',
      recreation_district_description: 'Complete District',
      recreation_access: [
        {
          description: 'Road',
          sub_access_code: null,
          sub_access_description: null,
        },
      ],
      maintenance_standard_description: 'Complete Maintenance',
      driving_directions: 'Complete Directions',
      project_established_date_readable_utc: 'Complete Date',
      risk_rating_description: 'Moderate',
    } as any;

    render(<RecResourceOverviewSection recResource={recResourceComplete} />);

    // All sections should be rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Closest Community')).toBeInTheDocument();
    expect(screen.getByText('Recreation District')).toBeInTheDocument();
    expect(screen.getByText('Access Type')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Type')).toBeInTheDocument();
    expect(screen.getByText('Driving Directions')).toBeInTheDocument();
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
    expect(screen.getByText('Risk Rating')).toBeInTheDocument();

    // All values should be rendered
    expect(screen.getByText('Complete Description')).toBeInTheDocument();
    expect(screen.getByText('Complete Community')).toBeInTheDocument();
    expect(screen.getByText('Complete District')).toBeInTheDocument();
    expect(screen.getByText('Road')).toBeInTheDocument();
    expect(screen.getByText('Complete Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Complete Directions')).toBeInTheDocument();
    expect(screen.getByText('Complete Date')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('renders child components', () => {
    render(<RecResourceOverviewSection recResource={recResource} />);
    expect(screen.getByText('RecResourceLocationSection')).toBeInTheDocument();
    expect(screen.getByText('RecResourceActivitySection')).toBeInTheDocument();
    expect(
      screen.getByText('RecResourceEstablishmentOrderSection'),
    ).toBeInTheDocument();
  });
});
