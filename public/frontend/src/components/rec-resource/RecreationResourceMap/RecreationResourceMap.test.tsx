import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationResourceMap } from './RecreationResourceMap';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import {
  downloadGPX,
  downloadKML,
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { trackEvent } from '@/utils/matomo';

vi.mock('@/components/StyledVectorFeatureMap', () => ({
  StyledVectorFeatureMap: vi.fn(() => <div data-testid="vector-map" />),
}));

vi.mock('@/components/rec-resource/RecreationResourceMap/helpers', () => ({
  getLayerStyleForRecResource: vi.fn(),
  getMapFeaturesFromRecResource: vi.fn().mockReturnValue([]),
  downloadGPX: vi.fn(),
  downloadKML: vi.fn(),
}));

vi.mock('@/utils/matomo', () => ({
  trackEvent: vi.fn(),
}));

describe('RecreationResourceMap', () => {
  const mockRecResource = {
    rec_resource_id: '123',
    name: 'Test Resource',
    site_point_geometry: {},
  } as any;

  const mockFeatures = [
    {
      id: 'feature1',
      clone: () => ({
        id: 'feature1-clone',
        setStyle: vi.fn(),
        getGeometry: vi.fn(() => ({ getType: () => 'Point' })),
      }),
      setStyle: vi.fn(),
    },
  ];
  const mockLayerStyle = { color: 'red' };
  const mockMapStyles = { height: '100px' };

  beforeEach(() => {
    vi.clearAllMocks();
    (getMapFeaturesFromRecResource as any).mockReturnValue(mockFeatures);
    (getLayerStyleForRecResource as any).mockReturnValue(mockLayerStyle);
  });

  it('renders map and download buttons when features exist', () => {
    render(
      <RecreationResourceMap
        recResource={mockRecResource}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(StyledVectorFeatureMap).toHaveBeenCalledWith(
      expect.objectContaining({
        features: mockFeatures,
        mapComponentCssStyles: mockMapStyles,
      }),
      undefined,
    );
    expect(
      screen.getByRole('button', { name: /Download GPX/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Download KML/i }),
    ).toBeInTheDocument();
  });

  it('returns null when features array is empty', () => {
    (getMapFeaturesFromRecResource as any).mockReturnValue([]);
    const { container } = render(
      <RecreationResourceMap recResource={mockRecResource} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when features is undefined', () => {
    (getMapFeaturesFromRecResource as any).mockReturnValue(undefined);
    const { container } = render(
      <RecreationResourceMap recResource={mockRecResource} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('memoizes helper calls on re-render with same recResource', () => {
    const { rerender } = render(
      <RecreationResourceMap recResource={mockRecResource} />,
    );
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledTimes(1);
    expect(getLayerStyleForRecResource).toHaveBeenCalledTimes(1);
    rerender(<RecreationResourceMap recResource={mockRecResource} />);
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledTimes(1);
    expect(getLayerStyleForRecResource).toHaveBeenCalledTimes(1);
  });

  it('handles undefined recResource prop correctly', () => {
    render(<RecreationResourceMap />);
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(undefined);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(undefined);
  });

  it('calls downloadGPX with recResource.name if defined', () => {
    render(
      <RecreationResourceMap
        recResource={{ ...mockRecResource, name: 'Special Name' }}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Download GPX/i }));
    expect(downloadGPX).toHaveBeenCalledWith(mockFeatures, 'Special Name');
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Download GPX',
      name: 'Special Name-123-Download GPX',
    });
  });

  it('calls downloadKML with recResource.name if defined', () => {
    render(
      <RecreationResourceMap
        recResource={{ ...mockRecResource, name: 'Special Name' }}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Download KML/i }));
    expect(downloadKML).toHaveBeenCalledWith(mockFeatures, 'Special Name');
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Download KML',
      name: 'Special Name-123-Download KML',
    });
  });

  it('uses "map" as name if recResource.name is undefined', () => {
    const resourceWithoutName = { ...mockRecResource, name: undefined };
    render(
      <RecreationResourceMap
        recResource={resourceWithoutName}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Download GPX/i }));
    expect(downloadGPX).toHaveBeenCalledWith(mockFeatures, 'map');
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Download GPX',
      name: 'map-123-Download GPX',
    });
    fireEvent.click(screen.getByRole('button', { name: /Download KML/i }));
    expect(downloadKML).toHaveBeenCalledWith(mockFeatures, 'map');
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Download KML',
      name: 'map-123-Download KML',
    });
  });
});
