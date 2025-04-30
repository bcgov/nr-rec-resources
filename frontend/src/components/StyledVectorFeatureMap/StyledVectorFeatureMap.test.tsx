import { Mock, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Feature } from 'ol';
import { StyleLike } from 'ol/style/Style';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import { useAddVectorLayerToMap } from '@/components/StyledVectorFeatureMap/hooks';
import { DEFAULT_MAP_PADDING } from '@/components/StyledVectorFeatureMap/constants';

// Mock constants
const MOCK_EXTENT = [0, 0, 100, 100];
const MOCK_HEIGHT = '400px';

// Mock functions
const mockFit = vi.fn();
const mockSetTarget = vi.fn();
const mockGetView = vi.fn(() => ({ fit: mockFit }));
const mockMap = {
  getView: mockGetView,
  setTarget: mockSetTarget,
};

// Mock OpenLayers Map
vi.mock('ol/Map', () => ({
  default: vi.fn(() => ({
    setTarget: mockSetTarget,
    getView: mockGetView,
  })),
}));

// Mock custom hooks
vi.mock('@/components/StyledVectorFeatureMap/hooks', () => ({
  useMapBaseLayers: vi.fn(() => []),
  useMapInitialization: vi.fn(() => mockMap),
  useAddVectorLayerToMap: vi.fn(),
  useOpenLayersTracking: vi.fn(),
}));

// Mock MapControls component
vi.mock('@/components/StyledVectorFeatureMap/components/MapControls', () => ({
  MapControls: vi.fn(() => <div data-testid="map-controls" />),
}));

describe('StyledVectorFeatureMap', () => {
  const defaultProps = {
    features: [] as Feature[],
    layerStyle: {} as StyleLike,
    mapComponentCssStyles: { height: MOCK_HEIGHT },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props = {}) => {
    return render(<StyledVectorFeatureMap {...defaultProps} {...props} />);
  };

  it('should render map container with correct styles and controls', () => {
    setup();
    expect(screen.getByTestId('map-container')).toHaveStyle({
      height: MOCK_HEIGHT,
    });
    expect(screen.getByTestId('map-controls')).toBeInTheDocument();
  });

  it('should render children when provided', () => {
    const testId = 'child';
    const childText = 'Test Child';
    setup({ children: <div data-testid={testId}>{childText}</div> });

    const child = screen.getByTestId(testId);
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent(childText);
  });

  it('should handle extent callback correctly', async () => {
    setup();

    // Simulate layer addition
    const { onLayerAdded } = (useAddVectorLayerToMap as Mock).mock.calls[0][0];

    act(() => {
      onLayerAdded(MOCK_EXTENT);
    });

    // Verify map interactions

    await waitFor(() => {
      expect(mockMap.getView).toHaveBeenCalled();
      expect(mockFit).toHaveBeenCalledWith(MOCK_EXTENT, {
        padding: DEFAULT_MAP_PADDING,
      });
    });
  });
});
