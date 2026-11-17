import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UnarchiveOptionsPanel } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/UnarchiveOptionsPanel';

vi.mock('@/components/RecResourceSpatial/SpatialSubmissionMap', () => ({
  SpatialSubmissionMap: () => <div data-testid="mock-spatial-submission-map" />,
}));

type GeometryType =
  | 'Polygon'
  | 'MultiPolygon'
  | 'LineString'
  | 'MultiLineString';

const createFeature = (geometryType: GeometryType) => ({
  type: 'Feature' as const,
  geometry: { type: geometryType, coordinates: [] },
  properties: {},
});

const defaultProps = {
  archivedAt: '2026-11-16T12:00:00.000Z',
  archiveAgeHours: 4,
  totalAreaHectares: 12.34,
  totalLengthKm: 5.67,
  onReuse: vi.fn(),
  onUploadNew: vi.fn(),
  onCancel: vi.fn(),
};

describe('UnarchiveOptionsPanel', () => {
  it('renders improved archived guidance copy', () => {
    render(
      <UnarchiveOptionsPanel
        {...defaultProps}
        features={[createFeature('Polygon')]}
      />,
    );

    expect(screen.getByText('Spatial data is archived')).toBeInTheDocument();
    expect(
      screen.getByText(/Choose one option to return it to/i),
    ).toBeInTheDocument();
  });

  it('shows Segments label for trail resources', () => {
    render(
      <UnarchiveOptionsPanel
        {...defaultProps}
        resourceTypeCode="RTE"
        features={[createFeature('LineString'), createFeature('LineString')]}
      />,
    );

    expect(screen.getByText('Segments')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows Lines label for non-trail line features', () => {
    render(
      <UnarchiveOptionsPanel
        {...defaultProps}
        resourceTypeCode="SIT"
        features={[createFeature('LineString')]}
      />,
    );

    expect(screen.getByText('Lines')).toBeInTheDocument();
    expect(screen.queryByText('Polygons')).not.toBeInTheDocument();
  });

  it('uses upload primary label when upload option is selected', () => {
    render(
      <UnarchiveOptionsPanel
        {...defaultProps}
        features={[createFeature('Polygon')]}
      />,
    );

    fireEvent.click(
      screen.getByRole('radio', {
        name: /Upload a new submission/i,
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Continue to upload' }),
    ).toBeInTheDocument();
  });

  it('uses resubmit label when archive age is older than 24 hours', () => {
    render(
      <UnarchiveOptionsPanel
        {...defaultProps}
        archiveAgeHours={36}
        features={[createFeature('Polygon')]}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Resubmit and restore' }),
    ).toBeInTheDocument();
  });
});
