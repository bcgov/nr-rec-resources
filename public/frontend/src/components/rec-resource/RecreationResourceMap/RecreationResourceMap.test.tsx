import { render } from '@testing-library/react';
import { RecreationResourceMap } from './RecreationResourceMap';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import {
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import { Mock, vi } from 'vitest';

// Mock the dependencies
vi.mock('@/components/StyledVectorFeatureMap', () => ({
  StyledVectorFeatureMap: vi.fn(() => null),
}));

vi.mock('@/components/rec-resource/RecreationResourceMap/helpers', () => ({
  getLayerStyleForRecResource: vi.fn(),
  getMapFeaturesFromRecResource: vi.fn(),
}));

describe('RecreationResourceMap', () => {
  const mockRecResource = {
    additional_fees: undefined,
    closest_community: '',
    description: undefined,
    name: '',
    rec_resource_type: '',
    recreation_access: undefined,
    recreation_activity: undefined,
    recreation_campsite: undefined,
    recreation_fee: undefined,
    recreation_resource_images: undefined,
    recreation_status: undefined,
    recreation_structure: undefined,
    rec_resource_id: '123',
    // Add other required properties
  } as any;

  const mockFeatures = [{ id: 'feature1' }];
  const mockLayerStyle = { color: 'red' };
  const mockMapStyles = { height: '100px' };

  beforeEach(() => {
    vi.clearAllMocks();
    (getMapFeaturesFromRecResource as Mock).mockReturnValue(mockFeatures);
    (getLayerStyleForRecResource as Mock).mockReturnValue(mockLayerStyle);
  });

  it('renders StyledVectorFeatureMap with correct props when features exist', () => {
    render(
      <RecreationResourceMap
        recResource={mockRecResource}
        mapComponentCssStyles={mockMapStyles}
      />,
    );

    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(mockRecResource);
    expect(StyledVectorFeatureMap).toHaveBeenCalledWith(
      {
        mapComponentCssStyles: mockMapStyles,
        features: mockFeatures,
        layerStyle: mockLayerStyle,
      },
      undefined,
    );
  });

  it('returns null when no features exist', () => {
    (getMapFeaturesFromRecResource as Mock).mockReturnValue([]);

    const { container } = render(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when features is undefined', () => {
    (getMapFeaturesFromRecResource as Mock).mockReturnValue(undefined);

    const { container } = render(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('memoizes features and layer style', () => {
    const { rerender } = render(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(getMapFeaturesFromRecResource).toHaveBeenCalledTimes(1);
    expect(getLayerStyleForRecResource).toHaveBeenCalledTimes(1);

    // Rerender with same props
    rerender(<RecreationResourceMap recResource={mockRecResource} />);

    // Should not call the functions again due to memoization
    expect(getMapFeaturesFromRecResource).toHaveBeenCalledTimes(1);
    expect(getLayerStyleForRecResource).toHaveBeenCalledTimes(1);
  });

  it('handles undefined recResource prop', () => {
    render(<RecreationResourceMap />);

    expect(getMapFeaturesFromRecResource).toHaveBeenCalledWith(undefined);
    expect(getLayerStyleForRecResource).toHaveBeenCalledWith(undefined);
  });
});
