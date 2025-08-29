import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection/RecResourceLocationSection';
import { RecreationResourceDetailUIModel } from '@/services';
import {
  getExtentFromRecResource,
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@shared/components/recreation-resource-map';
import { trackEvent } from '@shared/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@shared/components/links', () => ({
  ExternalLink: ({ url, label }: { url: string; label: string }) => (
    <a href={url}>{label}</a>
  ),
}));

vi.mock('@shared/components/recreation-resource-map', () => ({
  RecreationResourceMap: () => <div>RecreationResourceMap</div>,
  DownloadMapModal: ({ isOpen }: { isOpen: boolean }) => (
    <div>{isOpen ? 'DownloadMapModal-Open' : 'DownloadMapModal-Closed'}</div>
  ),
  ExportMapFileBtn: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>ExportMapFileBtn</button>
  ),
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMapFeaturesFromRecResource).mockReturnValue([]);
    vi.mocked(getLayerStyleForRecResource).mockReturnValue(() => []);
    vi.mocked(getExtentFromRecResource).mockReturnValue(undefined);
  });

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
    expect(screen.getByText('DownloadMapModal-Closed')).toBeInTheDocument();
  });

  it('opens download modal when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<RecResourceLocationSection recResource={baseResource} />);

    const exportButton = screen.getByText('ExportMapFileBtn');
    await user.click(exportButton);

    expect(screen.getByText('DownloadMapModal-Open')).toBeInTheDocument();
  });

  it('tracks event when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<RecResourceLocationSection recResource={baseResource} />);

    const exportButton = screen.getByText('ExportMapFileBtn');
    await user.click(exportButton);

    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Export map file',
      name: 'Test Resource-123-Export map file',
    });
  });

  it('uses default name "Unnamed Resource" when resource name is not provided', async () => {
    const user = userEvent.setup();
    const resourceWithoutName = {
      rec_resource_id: '456',
      name: undefined,
      site_point_geometry: { type: 'Point', coordinates: [123, 456] },
    } as unknown as RecreationResourceDetailUIModel;

    render(<RecResourceLocationSection recResource={resourceWithoutName} />);

    const exportButton = screen.getByText('ExportMapFileBtn');
    await user.click(exportButton);

    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Export map file',
      name: 'Unnamed Resource-456-Export map file',
    });
  });

  it('generates download styled features correctly', () => {
    const mockFeature = {
      setStyle: vi.fn(),
    };
    vi.mocked(getMapFeaturesFromRecResource).mockReturnValue([mockFeature]);
    vi.mocked(getLayerStyleForRecResource).mockReturnValue(() => []);

    render(<RecResourceLocationSection recResource={baseResource} />);

    expect(vi.mocked(getMapFeaturesFromRecResource)).toHaveBeenCalledWith(
      baseResource,
    );
    expect(vi.mocked(getLayerStyleForRecResource)).toHaveBeenCalledWith(
      baseResource,
      'download',
    );
    expect(mockFeature.setStyle).toHaveBeenCalled();
  });

  it('returns empty array for download styled features when no features exist', () => {
    vi.mocked(getMapFeaturesFromRecResource).mockReturnValue([]);

    render(<RecResourceLocationSection recResource={baseResource} />);

    // Component should still render without errors
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders mapview link when extent is available', () => {
    vi.mocked(getExtentFromRecResource).mockReturnValue([
      100.5, 200.3, 300.7, 400.9,
    ]);

    render(<RecResourceLocationSection recResource={baseResource} />);

    const mapviewLink = screen.getByText('Open in Mapview');
    expect(mapviewLink).toBeInTheDocument();
    expect(mapviewLink).toHaveAttribute(
      'href',
      'https://arcmaps.gov.bc.ca/ess/hm/mapview/?runWorkflow=Startup&Theme=TEN&extent=101,200,301,401',
    );
  });

  it('does not render mapview link when extent is not available', () => {
    vi.mocked(getExtentFromRecResource).mockReturnValue(undefined);

    render(<RecResourceLocationSection recResource={baseResource} />);

    expect(screen.queryByText('Open in Mapview')).not.toBeInTheDocument();
  });

  it('rounds extent values to integers for mapview URL', () => {
    vi.mocked(getExtentFromRecResource).mockReturnValue([
      123.456, 234.567, 345.678, 456.789,
    ]);

    render(<RecResourceLocationSection recResource={baseResource} />);

    const mapviewLink = screen.getByText('Open in Mapview');
    expect(mapviewLink).toHaveAttribute(
      'href',
      'https://arcmaps.gov.bc.ca/ess/hm/mapview/?runWorkflow=Startup&Theme=TEN&extent=123,235,346,457',
    );
  });
});
