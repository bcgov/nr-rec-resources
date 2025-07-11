import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationResourceMap } from './RecreationResourceMap';
import { VectorFeatureMap } from '@bcgov/prp-map';
import Feature from 'ol/Feature';
import { Style, Fill } from 'ol/style';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { trackEvent } from '@/utils/matomo';

// Mock the dependencies
vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: vi.fn(() => null),
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

  const mockFeatures = [new Feature({ id: 'feature1' })];
  mockFeatures[0].setId('feature1');

  const mockLayerStyle = new Style({
    fill: new Fill({ color: 'rgba(255,0,0,0.4)' }),
  });
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

    expect(VectorFeatureMap).toHaveBeenCalledWith(
      expect.objectContaining({
        layers: [
          expect.objectContaining({
            id: 'rec-resource-layer',
          }),
        ],
      }),
      undefined,
    );

    expect(
      screen.getByRole('button', { name: /Export map file/i }),
    ).toBeInTheDocument();
  });

  it('renders VectorFeatureMap with correct props when features exist', () => {
    render(
      <RecreationResourceMap
        recResource={mockRecResource}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(mockRecResource);

    expect(VectorFeatureMap).toHaveBeenCalledWith(
      expect.objectContaining({
        layers: [
          expect.objectContaining({
            id: 'rec-resource-layer',
          }),
        ],
      }),
      undefined,
    );

    expect(
      screen.getByRole('button', { name: /Export map file/i }),
    ).toBeInTheDocument();
  });

  it('renders VectorFeatureMap with correct props when features exist', () => {
    render(
      <RecreationResourceMap
        recResource={mockRecResource}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(mockRecResource);

    expect(VectorFeatureMap).toHaveBeenCalledWith(
      expect.objectContaining({
        layers: [
          expect.objectContaining({
            id: 'rec-resource-layer',
          }),
        ],
      }),
      undefined,
    );

    expect(
      screen.getByRole('button', { name: /Export map file/i }),
    ).toBeInTheDocument();
  });

  it('renders VectorFeatureMap with correct props when features exist', () => {
    render(
      <RecreationResourceMap
        recResource={mockRecResource}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(mockRecResource);

    expect.objectContaining({
      mapComponentCssStyles: mockMapStyles,
      layers: expect.arrayContaining([
        expect.objectContaining({
          id: 'rec-resource-layer',
          layerInstance: expect.any(Object),
        }),
      ]),
    });
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

  it('calls modal Export map file with recResource if defined', () => {
    render(
      <RecreationResourceMap
        recResource={{ ...mockRecResource, name: 'Special Name' }}
        mapComponentCssStyles={mockMapStyles}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Export map file/i }));
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Export map file',
      name: 'Special Name-123-Export map file',
    });
  });
});
