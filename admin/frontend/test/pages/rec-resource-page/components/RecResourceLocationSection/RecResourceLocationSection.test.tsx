import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection/RecResourceLocationSection';
import { RecreationResourceDetailUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import { vi, it } from 'vitest';

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@shared/components/recreation-resource-map', () => ({
  RecreationResourceMap: () => <div>RecreationResourceMap</div>,
  DownloadMapModal: () => <div>DownloadMapModal</div>,
  ExportMapFileBtn: () => <button>ExportMapFileBtn</button>,
  getMapFeaturesFromRecResource: vi.fn(),
  getLayerStyleForRecResource: vi.fn(),
  getExtentFromRecResource: vi.fn(),
  MATOMO_TRACKING_CATEGORY_MAP: 'Map',
  StyleContext: {
    DOWNLOAD: 'download',
  },
}));

describe('RecResourceLocationSection', () => {
  const baseResource = {
    rec_resource_id: '123',
    name: 'Test Resource',
    site_point_geometry: { type: 'Point', coordinates: [123, 456] },
  } as unknown as RecreationResourceDetailUIModel;

  it('renders location section with title', () => {
    render(<RecResourceLocationSection recResource={baseResource} />);
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders map component', () => {
    render(<RecResourceLocationSection recResource={baseResource} />);
    expect(screen.getByText('RecreationResourceMap')).toBeInTheDocument();
  });

  it('renders export map button', () => {
    render(<RecResourceLocationSection recResource={baseResource} />);
    expect(screen.getByText('ExportMapFileBtn')).toBeInTheDocument();
  });

  it('returns null when no geometry is present', () => {
    const resourceWithoutGeometry = {
      rec_resource_id: '123',
      name: 'No Geometry Resource',
      site_point_geometry: null,
      spatial_feature_geometry: null,
    } as unknown as RecreationResourceDetailUIModel;

    const { container } = render(
      <RecResourceLocationSection recResource={resourceWithoutGeometry} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when site_point_geometry is present', () => {
    const resourceWithPointGeometry = {
      rec_resource_id: '123',
      name: 'Point Resource',
      site_point_geometry: { type: 'Point', coordinates: [123, 456] },
      spatial_feature_geometry: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(
      <RecResourceLocationSection recResource={resourceWithPointGeometry} />,
    );
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders when spatial_feature_geometry is present', () => {
    const resourceWithSpatialGeometry = {
      rec_resource_id: '123',
      name: 'Spatial Resource',
      site_point_geometry: null,
      spatial_feature_geometry: { type: 'Polygon', coordinates: [] },
    } as unknown as RecreationResourceDetailUIModel;

    render(
      <RecResourceLocationSection recResource={resourceWithSpatialGeometry} />,
    );
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders download modal component', () => {
    render(<RecResourceLocationSection recResource={baseResource} />);
    expect(screen.getByText('DownloadMapModal')).toBeInTheDocument();
  });
});
