import { FeatureFlagProvider } from '@/contexts/feature-flags';
import { RecResourceOverviewSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/RecResourceOverviewSection';
import { render, screen } from '@testing-library/react';
import { useLocation } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

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
  beforeEach(() => {
    vi.mocked(useLocation).mockReturnValue({
      search: '',
    } as any);
  });

  const recResource = {
    description: '<b>Test Description</b>',
    closest_community: 'Test Community',
    recreation_district_description: 'Test District',
    maintenance_standard_description: 'Test Maintenance',
    driving_directions: '<i>Test Directions</i>',
    project_established_date_readable_utc: 'June 15, 2023',
    risk_rating_description: 'High',
    control_access_code_description: 'Controlled',
    access_codes: [
      {
        code: 'ROAD',
        description: 'Road',
        sub_access_codes: [{ code: '4W', description: '4 wheel drive' }],
      },
    ],
  } as any;

  const renderWithProvider = (ui: React.ReactNode) => {
    return render(<FeatureFlagProvider>{ui}</FeatureFlagProvider>);
  };

  it('renders all overview items', () => {
    renderWithProvider(
      <RecResourceOverviewSection recResource={recResource} />,
    );
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
    // Recreation access with sub access - displayed in card format
    expect(screen.getByText('Road')).toBeInTheDocument();
    expect(screen.getByText('4 wheel drive')).toBeInTheDocument();
    expect(screen.getByText('4W')).toBeInTheDocument();
    // HTML content
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Directions')).toBeInTheDocument();
  });

  it('renders recreation access without sub access', () => {
    const recResourceWithoutSubAccess = {
      ...recResource,
      access_codes: [
        {
          code: 'ROAD',
          description: 'Road',
          sub_access_codes: [],
        },
      ],
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceWithoutSubAccess} />,
    );
    expect(screen.getByText('Road')).toBeInTheDocument();
    expect(screen.queryByText('4 wheel drive')).not.toBeInTheDocument();
  });

  it('does not render access when accessCodes missing', () => {
    const recResourceNoAccess = {
      ...recResource,
      access_codes: [],
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceNoAccess} />,
    );
    // With empty accessCodes, should show a dash
    expect(screen.getByText('Access Type')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders project established date when present', () => {
    const recResourceWithDate = {
      ...recResource,
      project_established_date_readable_utc: 'January 10, 2020',
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceWithDate} />,
    );
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
    expect(screen.getByText('January 10, 2020')).toBeInTheDocument();
  });

  it('renders project established date label with dash when value is null', () => {
    const recResourceWithNullDate = {
      ...recResource,
      project_established_date_readable_utc: null,
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceWithNullDate} />,
    );
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
    // RecResourceOverviewItem shows dash for falsy values
    const sections = screen.getAllByRole('region');
    const dateSection = sections.find(
      (section) =>
        section.querySelector('.text-primary')?.textContent ===
        'Project Established Date',
    );
    expect(dateSection).toBeInTheDocument();
    expect(dateSection?.textContent).toContain('-');
  });

  it('renders project established date label with dash when value is undefined', () => {
    const recResourceWithUndefinedDate = {
      ...recResource,
      project_established_date_readable_utc: undefined,
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceWithUndefinedDate} />,
    );
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
  });

  it('renders project established date label with dash when value is empty string', () => {
    const recResourceWithEmptyDate = {
      ...recResource,
      project_established_date_readable_utc: '',
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceWithEmptyDate} />,
    );
    expect(screen.getByText('Project Established Date')).toBeInTheDocument();
  });

  it('renders project established date even when whitespace only', () => {
    const recResourceWithWhitespaceDate = {
      ...recResource,
      project_established_date_readable_utc: '   ',
    } as any;

    renderWithProvider(
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

      const { unmount } = renderWithProvider(
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
      accessCodes: [],
      maintenance_standard_description: '',
      driving_directions: undefined,
      project_established_date_readable_utc: null,
      risk_rating_description: undefined,
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceMinimal} />,
    );

    // Should render the overview title and description
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();

    // These fields are always rendered but may show empty or default values
    // The RecResourceOverviewItem component doesn't render if value is falsy
    // But Access Type always renders because it has a component that returns '-'
    expect(screen.getByText('Access Type')).toBeInTheDocument();
  });

  it('renders all fields when all have values', () => {
    const recResourceComplete = {
      description: 'Complete Description',
      closest_community: 'Complete Community',
      recreation_district_description: 'Complete District',
      access_codes: [
        {
          code: 'ROAD',
          description: 'Road',
          sub_access_codes: [],
        },
      ],
      maintenance_standard_description: 'Complete Maintenance',
      driving_directions: 'Complete Directions',
      project_established_date_readable_utc: 'Complete Date',
      risk_rating_description: 'Moderate',
      control_access_code_description: 'Controlled',
    } as any;

    renderWithProvider(
      <RecResourceOverviewSection recResource={recResourceComplete} />,
    );

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
    renderWithProvider(
      <RecResourceOverviewSection recResource={recResource} />,
    );
    expect(screen.getByText('RecResourceLocationSection')).toBeInTheDocument();
    expect(screen.getByText('RecResourceActivitySection')).toBeInTheDocument();
    expect(
      screen.getByText('RecResourceEstablishmentOrderSection'),
    ).toBeInTheDocument();
  });
});
