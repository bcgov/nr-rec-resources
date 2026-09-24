import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DEFAULT_WIZARD_VALUES } from '@/components/RecResourceSpatial/SpatialSubmissionSection.constants';
import { SpatialSubmissionFormFields } from '@/components/RecResourceSpatial/SpatialSubmissionFormFields';
import { WizardValues } from '@/components/RecResourceSpatial/SpatialSubmissionSection.types';

describe('SpatialSubmissionFormFields', () => {
  const mockSetValues = vi.fn();
  const mockSetMetadata = vi.fn();
  const mockHasMissingField = vi.fn();
  const mockOnSpatialFilesChange = vi.fn();
  const mockOnValidateSpatialFile = vi.fn();

  const defaultProps = {
    values: DEFAULT_WIZARD_VALUES,
    setValues: mockSetValues,
    setMetadata: mockSetMetadata,
    hasMissingField: mockHasMissingField,
    recreationTypeOptions: [
      { id: 'SIT', label: 'Site' },
      { id: 'RTE', label: 'Route' },
    ],
    naturalResourceDistrictOptions: [
      { id: 'DCC', label: 'Chilliwack Natural Resource District' },
    ],
    recreationDistrictOptions: [
      { id: 'RDCC', label: 'Chilliwack Recreation District' },
    ],
    areDistrictOptionsLoading: false,
    requestCreated: false,
    isProcessing: false,
    onSpatialFilesChange: mockOnSpatialFilesChange,
    onValidateSpatialFile: mockOnValidateSpatialFile,
  };

  it('renders all form fields', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    expect(screen.getByLabelText('Recreation Name')).toBeDefined();
    expect(screen.getByLabelText('Recreation type')).toBeDefined();
    expect(screen.getByLabelText('Feature type')).toBeDefined();
    expect(screen.getByLabelText('Email Address')).toBeDefined();
    expect(screen.getByLabelText('Telephone Number')).toBeDefined();
    expect(screen.getByLabelText('Submitter Name')).toBeDefined();
    expect(screen.getByLabelText('Natural Resource District')).toBeDefined();
    expect(screen.getByLabelText('Recreation District')).toBeDefined();
    expect(screen.getByLabelText('REC#')).toBeDefined();
    expect(screen.getByLabelText('Coordinate System')).toBeDefined();
    expect(screen.getByLabelText('Spatial File')).toBeDefined();
    expect(screen.getByText('Validate')).toBeDefined();
  });

  it('renders REC# as readonly and disabled', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const recInput = screen.getByLabelText('REC#') as HTMLInputElement;
    expect(recInput).toHaveAttribute('readonly');
    expect(recInput).toHaveAttribute('disabled');
  });

  it('renders Coordinate System as readonly and disabled', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const coordInput = screen.getByLabelText(
      'Coordinate System',
    ) as HTMLInputElement;
    expect(coordInput).toHaveAttribute('readonly');
    expect(coordInput).toHaveAttribute('disabled');
  });

  it('disables spatial file input when request is created', () => {
    const props = { ...defaultProps, requestCreated: true };
    render(<SpatialSubmissionFormFields {...props} />);

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('disabled');
  });

  it('disables validate button when processing', () => {
    const props = { ...defaultProps, isProcessing: true };
    render(<SpatialSubmissionFormFields {...props} />);

    const validateBtn = screen.getByRole('button', { name: 'Validating...' });
    expect(validateBtn).toHaveAttribute('disabled');
  });

  it('shows validating spinner when processing', () => {
    const props = { ...defaultProps, isProcessing: true };
    render(<SpatialSubmissionFormFields {...props} />);

    expect(screen.getByText('Validating...')).toBeDefined();
  });

  it('calls onSpatialFilesChange when file is selected', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const fileInput = screen.getByLabelText('Spatial File');
    const file = new File(['test'], 'test.shp', {
      type: 'application/octet-stream',
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnSpatialFilesChange).toHaveBeenCalled();
  });

  it('calls onValidateSpatialFile when validate button is clicked', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    fireEvent.click(screen.getByText('Validate'));

    expect(mockOnValidateSpatialFile).toHaveBeenCalled();
  });

  it('displays recreation type options', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    expect(screen.getByRole('option', { name: 'Site' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Route' })).toBeDefined();
  });

  it('updates recreation type when selected', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const select = screen.getByLabelText('Recreation type');
    fireEvent.change(select, { target: { value: 'RTE' } });

    expect(mockSetValues).toHaveBeenCalled();
  });

  it('displays feature type options', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    expect(screen.getByRole('option', { name: 'Linear' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Polygon' })).toBeDefined();
  });

  it('updates feature type when selected', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const select = screen.getByLabelText('Feature type');
    fireEvent.change(select, { target: { value: 'Polygon' } });

    expect(mockSetValues).toHaveBeenCalled();
  });

  it('updates recreation name when entered', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const input = screen.getByLabelText('Recreation Name');
    fireEvent.change(input, { target: { value: 'Test Recreation' } });

    expect(mockSetValues).toHaveBeenCalled();
  });

  it('updates email when entered', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const input = screen.getByLabelText('Email Address');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(mockSetMetadata).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('updates telephone when entered', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const input = screen.getByLabelText('Telephone Number');
    fireEvent.change(input, { target: { value: '6045550100' } });

    expect(mockSetMetadata).toHaveBeenCalledWith('telephone', '6045550100');
  });

  it('updates submitter name when entered', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const input = screen.getByLabelText('Submitter Name');
    fireEvent.change(input, { target: { value: 'Test User' } });

    expect(mockSetMetadata).toHaveBeenCalledWith('contactName', 'Test User');
  });

  it('updates natural resource district when selected', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const select = screen.getByLabelText('Natural Resource District');
    fireEvent.change(select, { target: { value: 'DCC' } });

    expect(mockSetMetadata).toHaveBeenCalledWith('districtCode', 'DCC');
  });

  it('updates recreation district when selected', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const select = screen.getByLabelText('Recreation District');
    fireEvent.change(select, { target: { value: 'RDCC' } });

    expect(mockSetMetadata).toHaveBeenCalledWith('recreationDistrict', 'RDCC');
  });

  it('disables district selects when loading', () => {
    const props = { ...defaultProps, areDistrictOptionsLoading: true };
    render(<SpatialSubmissionFormFields {...props} />);

    const nrdSelect = screen.getByLabelText(
      'Natural Resource District',
    ) as HTMLSelectElement;
    const rdSelect = screen.getByLabelText(
      'Recreation District',
    ) as HTMLSelectElement;

    expect(nrdSelect).toHaveAttribute('disabled');
    expect(rdSelect).toHaveAttribute('disabled');
  });

  it('shows loading text for recreation type when options are empty', () => {
    const props = {
      ...defaultProps,
      recreationTypeOptions: [],
    };
    render(<SpatialSubmissionFormFields {...props} />);

    expect(screen.getByText('Loading recreation types...')).toBeDefined();
  });

  it('shows loading text for districts when loading', () => {
    const props = { ...defaultProps, areDistrictOptionsLoading: true };
    render(<SpatialSubmissionFormFields {...props} />);

    const options = screen.getAllByText('Loading districts...');
    expect(options.length).toBeGreaterThan(0);
  });

  it('disables validate button when request is created', () => {
    const props = { ...defaultProps, requestCreated: true };
    render(<SpatialSubmissionFormFields {...props} />);

    const validateBtn = screen.getByRole('button', { name: 'Validate' });
    expect(validateBtn).toHaveAttribute('disabled');
  });

  it('displays file accept attribute correctly', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', '.zip,.shp,.dbf');
  });

  it('displays file multiple attribute', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('displays shapefile upload help text', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    expect(
      screen.getByText('Upload your shapefile as a single .zip bundle.'),
    ).toBeDefined();
  });

  it('displays telephone placeholder', () => {
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const input = screen.getByLabelText('Telephone Number') as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', '10 digits (e.g. 6045550100)');
  });

  it('displays validation feedback for missing required fields', () => {
    mockHasMissingField.mockReturnValue(true);
    render(<SpatialSubmissionFormFields {...defaultProps} />);

    const feedbackItems = screen.getAllByText('This is required.');
    expect(feedbackItems.length).toBeGreaterThan(0);
  });

  it('renders with populated values', () => {
    const populatedValues: WizardValues = {
      ...DEFAULT_WIZARD_VALUES,
      recreationName: 'Test Park',
      recreationType: 'SIT',
      featureType: 'Polygon',
      metadata: {
        ...DEFAULT_WIZARD_VALUES.metadata,
        email: 'user@example.com',
        telephone: '6045550100',
        contactName: 'John Doe',
        districtCode: 'DCC',
        recreationDistrict: 'RDCC',
        licenseRecNumber: 'REC123',
      },
    };

    const props = { ...defaultProps, values: populatedValues };
    render(<SpatialSubmissionFormFields {...props} />);

    expect(
      (screen.getByLabelText('Recreation Name') as HTMLInputElement).value,
    ).toBe('Test Park');
    expect(
      (screen.getByLabelText('Email Address') as HTMLInputElement).value,
    ).toBe('user@example.com');
    expect(
      (screen.getByLabelText('Telephone Number') as HTMLInputElement).value,
    ).toBe('6045550100');
    expect(
      (screen.getByLabelText('Submitter Name') as HTMLInputElement).value,
    ).toBe('John Doe');
  });
});
