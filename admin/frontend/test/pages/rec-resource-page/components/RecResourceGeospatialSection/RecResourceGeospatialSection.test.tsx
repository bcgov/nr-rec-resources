import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/routes/rec-resource/$id/geospatial', () => ({
  Route: {
    useLoaderData: () => ({
      geospatialData: {
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
        latitude: 49.123456,
        longitude: -123.654321,
      },
    }),
  },
}));

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceLocationSection',
  () => ({
    RecResourceLocationSection: ({ recResource }: any) => (
      <div data-testid="mock-location">
        LocationSection:{recResource?.utm_zone}
      </div>
    ),
  }),
);

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
}));

const { RecResourceGeospatialSection } = await import(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/RecResourceGeospatialSection'
);

describe('RecResourceGeospatialSection', () => {
  it('renders header and edit link', () => {
    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('Geospatial')).toBeDefined();
    expect(screen.getByText('Edit')).toBeDefined();
  });

  it('renders geospatial overview items with formatted coordinates', () => {
    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('UTM zone')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();

    expect(screen.getByText('UTM easting')).toBeDefined();
    expect(screen.getByText('500000')).toBeDefined();

    expect(screen.getByText('UTM northing')).toBeDefined();
    expect(screen.getByText('5480000')).toBeDefined();

    expect(screen.getByText('Latitude')).toBeDefined();
    expect(screen.getByText('49.123456')).toBeDefined();

    expect(screen.getByText('Longitude')).toBeDefined();
    expect(screen.getByText('-123.654321')).toBeDefined();
  });

  it('renders RecResourceLocationSection when geospatialData exists', () => {
    render(<RecResourceGeospatialSection />);

    expect(screen.getByTestId('mock-location')).toHaveTextContent(
      'LocationSection:10',
    );
  });
});
