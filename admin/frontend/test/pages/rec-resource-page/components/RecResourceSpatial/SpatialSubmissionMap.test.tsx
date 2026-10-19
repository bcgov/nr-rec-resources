import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpatialSubmissionMap } from '@/pages/rec-resource-page/components/RecResourceSpatial/SpatialSubmissionMap';
import { GeoJSON } from 'ol/format';

// --- Mocks ---

const mockFit = vi.fn();
const mockSetTarget = vi.fn();
const mockOn = vi.fn();
const mockUn = vi.fn();
const mockForEachFeatureAtPixel = vi.fn();
const mockGetExtent = vi.fn().mockReturnValue([0, 0, 10, 10]);
const mockClear = vi.fn();
const mockAddFeatures = vi.fn();
const mockGetFeatures = vi.fn().mockReturnValue([]);

const mockOlMap = {
  getView: () => ({ fit: mockFit }),
  setTarget: mockSetTarget,
  on: mockOn,
  un: mockUn,
  forEachFeatureAtPixel: mockForEachFeatureAtPixel,
};

vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: vi.fn(({ ref }) => {
    if (ref) {
      ref.current = { getMap: () => mockOlMap };
    }
    return <div data-testid="map-container" />;
  }),
}));

vi.mock('ol/source/Vector', () => ({
  default: class {
    getExtent = mockGetExtent;
    clear = mockClear;
    addFeatures = mockAddFeatures;
    getFeatures = mockGetFeatures;
    on = vi.fn();
  },
}));

vi.mock('ol/layer/Vector', () => ({
  default: class {
    changed = vi.fn();
  },
}));

vi.mock('ol/format/GeoJSON', () => {
  const MockGeoJSON = function () {};
  MockGeoJSON.prototype.readFeatures = vi
    .fn()
    .mockImplementation(({ features }) => {
      if (!features || features.length === 0) return [];
      return features.map((_, index) => ({
        get: vi.fn().mockReturnValue(index),
        set: vi.fn(),
        setStyle: vi.fn(),
        changed: vi.fn(),
        getGeometry: () => ({
          getExtent: () => [1, 1, 2, 2],
        }),
      }));
    });
  return { GeoJSON: MockGeoJSON };
});

vi.mock('ol/format/EsriJSON', () => ({
  default: class {},
}));

vi.mock('ol/layer/Group', () => ({
  default: class {},
}));

vi.mock('ol/layer/Tile', () => ({
  default: class {},
}));

vi.mock('ol/source/XYZ', () => ({
  default: class {},
}));

vi.mock('ol/extent', () => ({
  isEmpty: vi.fn((extent) => !extent || extent.length === 0),
}));

vi.mock('ol/loadingstrategy', () => ({
  bbox: vi.fn(),
}));

vi.mock('proj4', () => ({
  default: {
    defs: vi.fn(),
  },
}));

vi.mock('ol/proj/proj4', () => ({
  register: vi.fn(),
}));

vi.mock('@shared/components/recreation-resource-map', () => ({
  useBaseMapStyledLayers: () => ({
    prpBaseLayer: {},
    canadaTopographicLayerBasic: {},
    worldBasemapV2Layer: {},
  }),
}));

describe('SpatialSubmissionMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<SpatialSubmissionMap features={[]} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('toggles the reference layers panel when the layer button is clicked', () => {
    render(<SpatialSubmissionMap features={[]} />);

    expect(screen.queryByText('Base layer')).not.toBeInTheDocument();

    const toggleButton = screen.getByRole('button', {
      name: /Toggle reference layers/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Base layer')).toBeInTheDocument();
    expect(screen.getByText('Reference layers')).toBeInTheDocument();
  });

  it('allows changing base layers via radio buttons', () => {
    render(<SpatialSubmissionMap features={[]} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Toggle reference layers/i }),
    );

    const topographicRadio = screen.getByLabelText('Topographic');
    fireEvent.click(topographicRadio);

    expect(topographicRadio).toBeChecked();
  });

  it('allows toggling optional reference layer checkboxes', () => {
    render(<SpatialSubmissionMap features={[]} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Toggle reference layers/i }),
    );

    const privateLotCheckbox = screen.getByLabelText('Private lot');
    fireEvent.click(privateLotCheckbox);
    expect(privateLotCheckbox).toBeChecked();

    fireEvent.click(privateLotCheckbox);
    expect(privateLotCheckbox).not.toBeChecked();
  });

  it('processes features and auto-fits extent on initial mount with features', () => {
    const mockFeatures = [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {},
      },
    ];

    render(<SpatialSubmissionMap features={mockFeatures} />);
    expect(mockClear).toHaveBeenCalled();
    expect(mockAddFeatures).toHaveBeenCalled();
    expect(mockFit).toHaveBeenCalled();
  });

  it('handles empty features array gracefully', () => {
    render(<SpatialSubmissionMap features={[]} />);
    expect(mockClear).toHaveBeenCalled();
    expect(mockAddFeatures).not.toHaveBeenCalled();
  });

  it('fits map to selected feature when selectedFeatureIndex is provided', () => {
    const mockFeatureInstance = {
      get: vi.fn().mockReturnValue(0),
      set: vi.fn(),
      setStyle: vi.fn(),
      changed: vi.fn(),
      getGeometry: () => ({
        getExtent: () => [5, 5, 6, 6],
      }),
    };

    mockGetFeatures.mockReturnValueOnce([mockFeatureInstance]);

    render(
      <SpatialSubmissionMap
        features={[
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
          },
        ]}
        selectedFeatureIndex={0}
      />,
    );
    expect(mockFit).toHaveBeenCalled();
  });

  it('triggers onFeatureSelect when map is clicked on an editor feature', () => {
    const onFeatureSelect = vi.fn();
    const mockFeature = {
      get: vi.fn().mockReturnValue(2),
    };

    mockForEachFeatureAtPixel.mockReturnValueOnce(mockFeature);

    render(
      <SpatialSubmissionMap features={[]} onFeatureSelect={onFeatureSelect} />,
    );

    const singleClickHandler = mockOn.mock.calls.find(
      (call) => call[0] === 'singleclick',
    )?.[1];
    expect(singleClickHandler).toBeDefined();

    singleClickHandler({ pixel: [100, 100] });

    expect(onFeatureSelect).toHaveBeenCalledWith(2);
  });

  it('does not trigger onFeatureSelect if clicked location has no feature or invalid index', () => {
    const onFeatureSelect = vi.fn();
    mockForEachFeatureAtPixel.mockReturnValueOnce(undefined);

    render(
      <SpatialSubmissionMap features={[]} onFeatureSelect={onFeatureSelect} />,
    );

    const singleClickHandler = mockOn.mock.calls.find(
      (call) => call[0] === 'singleclick',
    )?.[1];
    singleClickHandler({ pixel: [100, 100] });

    expect(onFeatureSelect).not.toHaveBeenCalled();
  });

  it('logs console warning when GeoJSON reader returns zero features', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    vi.spyOn(GeoJSON.prototype, 'readFeatures').mockReturnValueOnce([]);

    render(
      <SpatialSubmissionMap
        features={[
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
          },
        ]}
      />,
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[SPATIAL MAP] GeoJSON reader returned 0 features',
      ),
      expect.any(Object),
    );

    consoleWarnSpy.mockRestore();
  });

  it('logs console error when GeoJSON parsing throws an error', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.spyOn(GeoJSON.prototype, 'readFeatures').mockImplementationOnce(() => {
      throw new Error('Parsing failed');
    });

    render(
      <SpatialSubmissionMap
        features={[
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
          },
        ]}
      />,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SPATIAL MAP] Error reading GeoJSON features:'),
      expect.any(Object),
    );

    consoleErrorSpy.mockRestore();
  });
});
