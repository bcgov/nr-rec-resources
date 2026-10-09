import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeatureSectionId } from '@/components/RecResourceSpatial/spatialSubmission.types';
import { SpatialSubmissionPreview } from '@/components/RecResourceSpatial/SpatialSubmissionPreview';

vi.mock('@/components/RecResourceSpatial/SpatialSubmissionMap', () => ({
  SpatialSubmissionMap: vi.fn(
    ({ selectedFeatureIndex, onFeatureSelect }: any) => (
      <div data-testid="mock-map">
        <span data-testid="selected-index">{selectedFeatureIndex}</span>
        <button onClick={() => onFeatureSelect?.(0)}>Select Feature</button>
      </div>
    ),
  ),
}));

describe('SpatialSubmissionPreview', () => {
  const mockSetSelectedFeatureIndex = vi.fn();
  const mockOnSectionIdChange = vi.fn();
  const mockOnCreateRequest = vi.fn();

  const mockFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { section_id: 'Section 1' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [1000000, 1000000],
            [1000100, 1000100],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { section_id: 'Section 2' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [1000200, 1000200],
            [1000300, 1000300],
          ],
        },
      },
    ],
  };

  const mockFeatureSectionIds: FeatureSectionId[] = [
    { featureIndex: 1, sectionId: 'Section 1' },
    { featureIndex: 2, sectionId: 'Section 2' },
  ];

  const defaultProps = {
    editableFeatureCollection: mockFeatureCollection,
    requiresSectionIds: true,
    featureSectionIds: mockFeatureSectionIds,
    selectedFeatureIndex: null,
    setSelectedFeatureIndex: mockSetSelectedFeatureIndex,
    selectedSectionFeature: mockFeatureSectionIds[0],
    onSectionIdChange: mockOnSectionIdChange,
    canCreateRequest: true,
    isCreatingRequest: false,
    requestCreated: false,
    onCreateRequest: mockOnCreateRequest,
  };

  it('returns null when no feature collection', () => {
    const props = { ...defaultProps, editableFeatureCollection: null };
    const { container } = render(<SpatialSubmissionPreview {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when feature collection has no features', () => {
    const props = {
      ...defaultProps,
      editableFeatureCollection: { type: 'FeatureCollection', features: [] },
    };
    const { container } = render(<SpatialSubmissionPreview {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders spatial preview label', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);
    expect(screen.getByText('Spatial preview')).toBeDefined();
  });

  it('renders info alert when section IDs are required', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);
    expect(
      screen.getByText(
        'Click a section in the list or on the map to rename it before creating the request.',
      ),
    ).toBeDefined();
  });

  it('does not render info alert when section IDs are not required', () => {
    const props = { ...defaultProps, requiresSectionIds: false };
    render(<SpatialSubmissionPreview {...props} />);
    expect(
      screen.queryByText(
        'Click a section in the list or on the map to rename it before creating the request.',
      ),
    ).toBeNull();
  });

  it('renders section count', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);
    expect(
      screen.getByText(`Sections (${mockFeatureSectionIds.length})`),
    ).toBeDefined();
  });

  it('renders sections list with feature labels', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    mockFeatureSectionIds.forEach((section) => {
      expect(screen.getByText(section.sectionId ?? '')).toBeDefined();
    });
  });

  it('renders feature index for each section', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    mockFeatureSectionIds.forEach((section) => {
      expect(
        screen.getByText(`Feature #${section.featureIndex}`),
      ).toBeDefined();
    });
  });

  it('highlights selected section', () => {
    const props = { ...defaultProps, selectedFeatureIndex: 0 };
    render(<SpatialSubmissionPreview {...props} />);

    const buttons = screen.getAllByRole('button');
    const selectedButton = buttons.find((btn) =>
      btn.className.includes('active'),
    );
    expect(selectedButton?.textContent).toContain('Section 1');
  });

  it('calls setSelectedFeatureIndex when section is clicked', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const sectionButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.className.includes('list-group-item'));
    fireEvent.click(sectionButtons[1]);

    expect(mockSetSelectedFeatureIndex).toHaveBeenCalledWith(1);
  });

  it('renders section ID input when section is selected', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const input = screen.getByLabelText(
      'Section ID / name',
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('Section 1');
  });

  it('calls onSectionIdChange when section ID input changes', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const input = screen.getByLabelText('Section ID / name');
    fireEvent.change(input, { target: { value: 'New Section Name' } });

    expect(mockOnSectionIdChange).toHaveBeenCalledWith('New Section Name');
  });

  it('displays placeholder for section ID input', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const input = screen.getByLabelText(
      'Section ID / name',
    ) as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', 'Enter a unique section name');
  });

  it('does not render section ID input when no section is selected', () => {
    const props = { ...defaultProps, selectedSectionFeature: null };
    const { container } = render(<SpatialSubmissionPreview {...props} />);

    expect(
      container.querySelector('input[aria-label="Section ID / name"]'),
    ).toBeNull();
  });

  it('renders map component with features', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    expect(screen.getByTestId('mock-map')).toBeDefined();
  });

  it('passes selected feature index to map', () => {
    const props = { ...defaultProps, selectedFeatureIndex: 1 };
    render(<SpatialSubmissionPreview {...props} />);

    expect(screen.getByTestId('selected-index')).toHaveTextContent('1');
  });

  it('calls setSelectedFeatureIndex when feature is selected on map', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const selectButton = screen.getByText('Select Feature');
    fireEvent.click(selectButton);

    expect(mockSetSelectedFeatureIndex).toHaveBeenCalledWith(0);
  });

  it('renders Create request button', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Create request' }),
    ).toBeDefined();
  });

  it('enables Create request button when canCreateRequest is true', () => {
    const props = { ...defaultProps, canCreateRequest: true };
    render(<SpatialSubmissionPreview {...props} />);

    const button = screen.getByRole('button', { name: 'Create request' });
    expect(button).not.toHaveAttribute('disabled');
  });

  it('disables Create request button when canCreateRequest is false', () => {
    const props = { ...defaultProps, canCreateRequest: false };
    render(<SpatialSubmissionPreview {...props} />);

    const button = screen.getByRole('button', { name: 'Create request' });
    expect(button).toHaveAttribute('disabled');
  });

  it('disables Create request button when isCreatingRequest is true', () => {
    const props = { ...defaultProps, isCreatingRequest: true };
    render(<SpatialSubmissionPreview {...props} />);

    const button = screen.getByRole('button', { name: /Creating request/i });
    expect(button).toHaveAttribute('disabled');
  });

  it('disables Create request button when requestCreated is true', () => {
    const props = { ...defaultProps, requestCreated: true };
    render(<SpatialSubmissionPreview {...props} />);

    const button = screen.getByRole('button', { name: 'Create request' });
    expect(button).toHaveAttribute('disabled');
  });

  it('shows spinner when creating request', () => {
    const props = { ...defaultProps, isCreatingRequest: true };
    render(<SpatialSubmissionPreview {...props} />);

    expect(screen.getByText('Creating request...')).toBeDefined();
  });

  it('calls onCreateRequest when Create request button is clicked', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Create request' });
    fireEvent.click(button);

    expect(mockOnCreateRequest).toHaveBeenCalled();
  });

  it('displays no features warning when no features are available', () => {
    const props = {
      ...defaultProps,
      requiresSectionIds: true,
      featureSectionIds: [],
      editableFeatureCollection: {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: {} }],
      },
    };
    render(<SpatialSubmissionPreview {...props} />);

    expect(
      screen.getByText('No section features were available to edit.'),
    ).toBeDefined();
  });

  it('does not display no features warning when there are features', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    expect(
      screen.queryByText('No section features were available to edit.'),
    ).toBeNull();
  });

  it('displays section count with correct feature count', () => {
    const manyFeatures = {
      ...mockFeatureCollection,
      features: Array.from({ length: 5 }, (_, i) => ({
        type: 'Feature',
        properties: { section_id: `Section ${i + 1}` },
        geometry: {
          type: 'LineString',
          coordinates: [
            [1000000 + i * 100, 1000000],
            [1000100 + i * 100, 1000100],
          ],
        },
      })),
    };

    const features = Array.from({ length: 5 }, (_, i) => ({
      featureIndex: i + 1,
      sectionId: `Section ${i + 1}`,
    }));

    const props = {
      ...defaultProps,
      editableFeatureCollection: manyFeatures,
      featureSectionIds: features,
    };

    render(<SpatialSubmissionPreview {...props} />);

    expect(screen.getByText('Sections (5)')).toBeDefined();
  });

  it('uses feature number as fallback label when section ID is null', () => {
    const featureSectionIdsWithNull: FeatureSectionId[] = [
      { featureIndex: 1, sectionId: null },
      { featureIndex: 2, sectionId: 'Section 2' },
    ];

    const props = {
      ...defaultProps,
      featureSectionIds: featureSectionIdsWithNull,
      selectedSectionFeature: featureSectionIdsWithNull[0],
    };

    render(<SpatialSubmissionPreview {...props} />);

    expect(screen.getAllByText('Feature #1').length).toBeGreaterThan(0);
  });

  it('trims whitespace from section ID for display', () => {
    const featureSectionIdsWithWhitespace: FeatureSectionId[] = [
      { featureIndex: 1, sectionId: '  Trimmed Section  ' },
    ];

    const props = {
      ...defaultProps,
      featureSectionIds: featureSectionIdsWithWhitespace,
    };

    const { container } = render(<SpatialSubmissionPreview {...props} />);
    const labels = container.querySelectorAll('.fw-semibold');
    expect(
      Array.from(labels).some((el) =>
        el.textContent?.includes('Trimmed Section'),
      ),
    ).toBe(true);
  });

  it('displays sections panel when there are features', () => {
    const { container } = render(
      <SpatialSubmissionPreview {...defaultProps} />,
    );

    const panel = container.querySelector('.list-group');
    expect(panel).toBeDefined();
  });

  it('applies list group styling to section items', () => {
    const { container } = render(
      <SpatialSubmissionPreview {...defaultProps} />,
    );

    const items = container.querySelectorAll('.list-group-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders only info alert when section IDs are required and features exist', () => {
    render(<SpatialSubmissionPreview {...defaultProps} />);

    const alert = screen.getByText(
      'Click a section in the list or on the map to rename it before creating the request.',
    );
    expect(alert).toBeDefined();
    expect(
      screen.queryByText('No section features were available to edit.'),
    ).toBeNull();
  });
});
