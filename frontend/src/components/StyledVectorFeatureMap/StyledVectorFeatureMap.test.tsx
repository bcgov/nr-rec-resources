import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Feature } from 'ol';
import { Style } from 'ol/style';
import * as hooks from './hooks';
import { ReactNode } from 'react';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';

type MapComponentProps = {
  children: ReactNode;
};

type MapControlsProps = {
  extent: number[] | undefined;
  center: number[] | undefined;
  zoom: number | undefined;
};

// Mock the hooks
vi.mock('./hooks', () => ({
  useMapBaseLayers: vi.fn(),
  useMapInitialization: vi.fn(),
  useAddVectorLayerToMap: vi.fn(),
}));

// Mock MapComponent and MapControls
vi.mock('@terrestris/react-geo/dist/Map/MapComponent/MapComponent', () => ({
  default: ({ children }: MapComponentProps): ReactNode => (
    <div data-testid="map-component">{children}</div>
  ),
}));

vi.mock('./components/MapControls', () => ({
  MapControls: ({ extent, center, zoom }: MapControlsProps): ReactNode => (
    <div
      data-testid="map-controls"
      data-extent={extent?.toString()}
      data-center={center?.toString()}
      data-zoom={zoom?.toString()}
    />
  ),
}));

describe('StyledVectorFeatureMap', () => {
  const mockMap = {
    getView: vi.fn(() => ({
      getZoom: (): number => 10,
    })),
  };

  const mockFeatures: Feature[] = [new Feature()];
  const mockStyle: Style = new Style();

  beforeEach(() => {
    vi.clearAllMocks();
    (hooks.useMapBaseLayers as Mock).mockReturnValue([]);
    (hooks.useMapInitialization as Mock).mockReturnValue(mockMap);
  });

  it('renders with required props', () => {
    render(
      <StyledVectorFeatureMap features={mockFeatures} layerStyle={mockStyle} />,
    );

    expect(screen.getByTestId('map-component')).toBeInTheDocument();
    expect(screen.getByTestId('map-controls')).toBeInTheDocument();
  });

  it('renders children components', () => {
    render(
      <StyledVectorFeatureMap features={mockFeatures} layerStyle={mockStyle}>
        <div data-testid="child-component">Child</div>
      </StyledVectorFeatureMap>,
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('initializes map with correct hooks', () => {
    render(
      <StyledVectorFeatureMap features={mockFeatures} layerStyle={mockStyle} />,
    );

    expect(hooks.useMapBaseLayers).toHaveBeenCalled();
    expect(hooks.useMapInitialization).toHaveBeenCalled();
    expect(hooks.useAddVectorLayerToMap).toHaveBeenCalledWith(
      expect.objectContaining({
        map: mockMap,
        features: mockFeatures,
        layerStyle: mockStyle,
      }),
    );
  });

  it('updates center and zoom extent when callback is triggered', () => {
    render(
      <StyledVectorFeatureMap features={mockFeatures} layerStyle={mockStyle} />,
    );

    const callback = (hooks.useAddVectorLayerToMap as Mock).mock.calls[0][0]
      .onLayerAdded;
    const mockCenter: [number, number] = [0, 0];
    const mockExtent: [number, number, number, number] = [0, 0, 1, 1];

    act(() => callback(mockCenter, mockExtent));

    expect(screen.getByTestId('map-controls')).toHaveAttribute(
      'data-center',
      mockCenter.toString(),
    );
    expect(screen.getByTestId('map-controls')).toHaveAttribute(
      'data-extent',
      mockExtent.toString(),
    );
  });
});
