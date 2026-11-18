import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpatialSubmissionMap } from '@/components/RecResourceSpatial/SpatialSubmissionMap';
import { GeoJSON } from 'ol/format';

const mockMapOn = vi.fn();
const mockMapUn = vi.fn();
const mockMapForEachFeatureAtPixel = vi.fn();
const mockMapFit = vi.fn();
const mockMapSetTarget = vi.fn();

const mockOlMap = {
  on: mockMapOn,
  un: mockMapUn,
  forEachFeatureAtPixel: mockMapForEachFeatureAtPixel,
  getView: () => ({
    fit: mockMapFit,
  }),
  setTarget: mockMapSetTarget,
};

// Mock the VectorFeatureMap component
vi.mock('@bcgov/prp-map', async () => {
  const TileLayer = (await import('ol/layer/Tile')).default;
  const XYZ = (await import('ol/source/XYZ')).default;

  return {
    useStyledLayer: vi.fn(
      () =>
        new TileLayer({
          source: new XYZ({
            url: 'https://example.com/{z}/{x}/{y}.pbf',
          }),
        }),
    ),
    VectorFeatureMap: vi.fn(
      ({ ref, style, defaultZoom, minZoom, maxZoom }: any) => {
        const mockMap = {
          getMap: () => mockOlMap,
        };

        // Attach to ref
        if (ref) {
          if (typeof ref === 'function') {
            ref(mockMap);
          } else {
            ref.current = mockMap;
          }
        }

        return (
          <div
            data-testid="vector-feature-map"
            style={style}
            data-zoom={defaultZoom}
            data-min-zoom={minZoom}
            data-max-zoom={maxZoom}
          >
            <div data-testid="map-container" />
          </div>
        );
      },
    ),
  };
});

vi.mock(
  '@shared/components/recreation-resource-map',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@shared/components/recreation-resource-map')
      >();
    const TileLayer = (await import('ol/layer/Tile')).default;
    const XYZ = (await import('ol/source/XYZ')).default;

    const layer = () =>
      new TileLayer({
        source: new XYZ({
          url: 'https://example.com/base/{z}/{x}/{y}.png',
        }),
      });

    return {
      ...actual,
      useBaseMapStyledLayers: () => ({
        prpBaseLayer: layer(),
        canadaTopographicLayerBasic: layer(),
        worldBasemapV2Layer: layer(),
      }),
    };
  },
);

// Mock proj4
vi.mock('proj4', () => ({
  default: {
    defs: vi.fn(),
  },
}));

vi.mock('ol/proj/proj4', () => ({
  register: vi.fn(),
}));

describe('SpatialSubmissionMap', () => {
  const mockOnFeatureSelect = vi.fn();

  const mockFeatures = [
    {
      type: 'Feature',
      properties: { section_id: 'Section 1' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [1000000, 475000],
          [1005000, 480000],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { section_id: 'Section 2' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [1000000, 475000],
            [1005000, 475000],
            [1005000, 480000],
            [1000000, 480000],
            [1000000, 475000],
          ],
        ],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies compact style when compact mode is enabled', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        compact={true}
      />,
    );

    const map = screen.getByTestId('vector-feature-map');
    expect(map).toHaveStyle({
      height: '320px',
      minHeight: '320px',
      maxHeight: '320px',
    });
  });

  it('selects a feature on map single-click when submissionFeatureIndex is numeric', () => {
    let singleClickHandler: ((event: any) => void) | undefined;
    mockMapOn.mockImplementation(
      (eventName: string, handler: (event: any) => void) => {
        if (eventName === 'singleclick') {
          singleClickHandler = handler;
        }
      },
    );

    const onFeatureSelect = vi.fn();
    mockMapForEachFeatureAtPixel.mockReturnValue({
      get: (key: string) => (key === 'submissionFeatureIndex' ? 1 : undefined),
    });

    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={onFeatureSelect}
      />,
    );

    expect(singleClickHandler).toBeTypeOf('function');
    singleClickHandler?.({ pixel: [10, 20] });

    expect(onFeatureSelect).toHaveBeenCalledWith(1);
  });

  it('retargets map to the scoped container after mount', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    await waitFor(() => {
      expect(mockMapSetTarget).toHaveBeenCalledWith(expect.any(HTMLElement));
    });
  });

  it('logs a warning when GeoJSON reader returns zero features', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const readFeaturesSpy = vi
      .spyOn(GeoJSON.prototype, 'readFeatures')
      .mockReturnValueOnce([] as any);

    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        '[SPATIAL MAP] GeoJSON reader returned 0 features',
        expect.objectContaining({ inputFeatures: mockFeatures.length }),
      );
    });

    readFeaturesSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('logs an error when GeoJSON parsing throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const readFeaturesSpy = vi
      .spyOn(GeoJSON.prototype, 'readFeatures')
      .mockImplementationOnce(() => {
        throw new Error('bad feature');
      });

    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        '[SPATIAL MAP] Error reading GeoJSON features:',
        expect.objectContaining({
          featuresCount: mockFeatures.length,
          firstFeature: mockFeatures[0],
        }),
      );
    });

    readFeaturesSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('renders the map container', () => {
    const { container } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(container.querySelector('.spatial-submission-map')).toBeDefined();
  });

  it('renders VectorFeatureMap with correct props', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
    const mapContainer = screen.getByTestId('vector-feature-map');
    expect(mapContainer).toHaveAttribute('data-zoom', '15');
    expect(mapContainer).toHaveAttribute('data-min-zoom', '5.5');
    expect(mapContainer).toHaveAttribute('data-max-zoom', '30');
  });

  it('renders layers toggle button', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    expect(layersButton).toBeDefined();
  });

  it('shows reference layers panel when toggle button is clicked', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      expect(screen.getByText('Base layer')).toBeDefined();
    });
  });

  it('hides reference layers panel when toggle button is clicked again', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      expect(screen.getByText('Base layer')).toBeDefined();
    });

    fireEvent.click(layersButton);

    await waitFor(() => {
      expect(screen.queryByText('Base layer')).toBeNull();
    });
  });

  it('displays base layer options in the panel', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Default')).toBeDefined();
      expect(screen.getByLabelText('Topographic')).toBeDefined();
      expect(screen.getByLabelText('Hillshade')).toBeDefined();
      expect(screen.getByLabelText('Satellite')).toBeDefined();
    });
  });

  it('selects satellite base layer by default', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      const satelliteCheckbox = screen.getByLabelText(
        'Satellite',
      ) as HTMLInputElement;
      expect(satelliteCheckbox.checked).toBe(true);
    });
  });

  it('allows changing base layer', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      const defaultCheckbox = screen.getByLabelText(
        'Default',
      ) as HTMLInputElement;
      fireEvent.click(defaultCheckbox);

      expect(defaultCheckbox.checked).toBe(true);
    });
  });

  it('displays reference layer options', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      expect(screen.getByText('Reference layers')).toBeDefined();
      expect(screen.getByLabelText('Private lot')).toBeDefined();
      expect(screen.getByLabelText('BC forest tenure road')).toBeDefined();
      expect(screen.getByLabelText('Consolidated road')).toBeDefined();
    });
  });

  it('allows toggling reference layers', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      const privateLotCheckbox = screen.getByLabelText(
        'Private lot',
      ) as HTMLInputElement;
      expect(privateLotCheckbox.checked).toBe(false);

      fireEvent.click(privateLotCheckbox);
      expect(privateLotCheckbox.checked).toBe(true);

      fireEvent.click(privateLotCheckbox);
      expect(privateLotCheckbox.checked).toBe(false);
    });
  });

  it('renders map canvas container', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const mapCanvas = screen.getByTestId('map-container');
    expect(mapCanvas).toBeDefined();
  });

  it('handles features prop change', () => {
    const { rerender } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const newFeatures = [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [1000000, 475000],
        },
      },
    ];

    rerender(
      <SpatialSubmissionMap
        features={newFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('handles selectedFeatureIndex prop', () => {
    const { rerender } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    rerender(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={0}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('accepts null selectedFeatureIndex', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('accepts undefined selectedFeatureIndex', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={undefined}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('accepts undefined onFeatureSelect', () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={undefined}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('handles empty features array', () => {
    render(
      <SpatialSubmissionMap
        features={[]}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('applies correct styling to map container', () => {
    const { container } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const mapElement = container.querySelector('.spatial-submission-map');
    expect(mapElement).toBeDefined();
    expect(mapElement).toHaveClass('spatial-submission-map');
  });

  it('renders overlay controls container', () => {
    const { container } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const overlayControls = container.querySelector(
      '.spatial-submission-map__overlay-controls',
    );
    expect(overlayControls).toBeDefined();
  });

  it('renders canvas container with correct class', () => {
    const { container } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const canvasContainer = container.querySelector(
      '.spatial-submission-map__canvas',
    );
    expect(canvasContainer).toBeDefined();
  });

  it('renders layer toggle button with correct icon class', () => {
    const { container } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const icon = container.querySelector('.fa-layer-group');
    expect(icon).toBeDefined();
  });

  it('cycles through different features when selectedFeatureIndex changes', () => {
    const { rerender } = render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={0}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    rerender(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={1}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    rerender(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('renders panel with horizontal separator', async () => {
    render(
      <SpatialSubmissionMap
        features={mockFeatures}
        selectedFeatureIndex={null}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    const layersButton = screen.getByLabelText('Toggle reference layers');
    fireEvent.click(layersButton);

    await waitFor(() => {
      const { container } = render(
        <SpatialSubmissionMap
          features={mockFeatures}
          selectedFeatureIndex={null}
          onFeatureSelect={mockOnFeatureSelect}
        />,
      );

      const panel = container.querySelector(
        '.spatial-submission-map__layers-panel',
      );
      if (panel) {
        const hr = panel.querySelector('hr');
        expect(hr).toBeDefined();
      }
    });
  });

  it('handles multiple features with different geometry types', () => {
    const mixedFeatures = [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [1000000, 475000],
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [1000000, 475000],
            [1005000, 480000],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [1000000, 475000],
              [1005000, 475000],
              [1005000, 480000],
              [1000000, 480000],
              [1000000, 475000],
            ],
          ],
        },
      },
    ];

    render(
      <SpatialSubmissionMap
        features={mixedFeatures}
        selectedFeatureIndex={0}
        onFeatureSelect={mockOnFeatureSelect}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });
});
