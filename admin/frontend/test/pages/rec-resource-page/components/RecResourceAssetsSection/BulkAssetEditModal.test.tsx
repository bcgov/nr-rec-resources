import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulkAssetEditModal } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/BulkAssetEditModal';
import { useBulkUpdateAssets } from '@/services/hooks/recreation-resource-admin/useBulkUpdateAssets';

// Mock the hook service
vi.mock(
  '@/services/hooks/recreation-resource-admin/useBulkUpdateAssets',
  () => ({
    useBulkUpdateAssets: vi.fn(),
  }),
);

// Mock custom components if necessary
vi.mock('@/components', () => ({
  CustomButton: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@bcgov/design-system-react-components', () => ({
  Checkbox: ({ isSelected, onChange }: any) => (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={onChange}
      data-testid="bcgov-checkbox"
    />
  ),
}));

describe('BulkAssetEditModal', () => {
  const mockMutate = vi.fn();
  const mockOnCancel = vi.fn();

  const sampleAssetTypes = [
    {
      structureCode: 101,
      description: 'Shelter',
      assets: [
        {
          asset_id: 1,
          asset_name: 'Shelter Alpha 1',
          asset_comment: 'Main Shelter',
          asset_length: 10,
          asset_width: 5,
          asset_area: 50,
          actual_value: 1000,
          parent_id: 10,
        },
        {
          asset_id: 2,
          asset_name: null,
          asset_comment: null,
          asset_length: null,
          asset_width: null,
          asset_area: null,
          actual_value: null,
          parent_id: null,
        },
      ],
    },
  ];

  const sampleCampsites = [
    {
      campsite: {
        asset_id: 10,
        asset_name: 'Campsite 10',
      },
    },
    {
      campsite: {
        asset_id: 20,
        asset_name: 'Site-B', // Non-digit trailing name branch
      },
    },
    {
      campsite: {
        asset_id: 30,
        asset_name: null, // Null asset_name branch
      },
    },
  ];

  const sampleAssetCodes = [
    {
      asset_code: 1,
      description: 'Table - Log',
      has_length: false,
      has_width: false,
      has_area: false,
    },
    {
      asset_code: 2,
      description: 'Table - Wheelchair Accessible',
      has_length: false,
      has_width: false,
      has_area: false,
    },
    {
      asset_code: 5,
      description: 'Toilet - Wood',
      has_length: false,
      has_width: false,
      has_area: false,
    },
    {
      asset_code: 6,
      description: 'Toilet - Wheelchair Accessible',
      has_length: false,
      has_width: false,
      has_area: false,
    },
    {
      asset_code: 11,
      description: 'Fire Ring',
      has_length: false,
      has_width: false,
      has_area: false,
    },
    {
      asset_code: 16,
      description: 'Litter Barrel - 45 Gallon',
      has_length: false,
      has_width: false,
      has_area: false,
    },
  ];

  const defaultProps = {
    show: true,
    rec_resource_id: 'rec-123',
    assetTypes: sampleAssetTypes as any,
    campsites: sampleCampsites as any,
    assetCodes: sampleAssetCodes as any,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBulkUpdateAssets as any).mockReturnValue({ mutate: mockMutate });
  });

  it('renders modal when show is true', () => {
    render(<BulkAssetEditModal {...defaultProps} />);
    expect(screen.getByText('Bulk update')).toBeInTheDocument();
    expect(screen.getByText('Select asset type')).toBeInTheDocument();
  });

  it('handles selecting asset type and resetting when empty option is selected', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    const select = screen.getByRole('combobox');

    // Select valid asset type
    fireEvent.change(select, { target: { value: '101' } });

    // Reset selection to empty
    fireEvent.change(select, { target: { value: '' } });

    const continueBtn = screen.getByText('Continue');
    expect(continueBtn).toBeDisabled();
  });

  it('handles Step 0 -> Step 1 transition and cancel on Step 0', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    // Click cancel in step 0
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);

    // Select structure code 101 and continue
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '101' } });

    const continueBtn = screen.getByText('Continue');
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    expect(screen.getByText('Update Shelter')).toBeInTheDocument();
  });

  it('handles individual asset selection, select all, and clear all in Step 1', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    // Advance to Step 1
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '101' },
    });
    fireEvent.click(screen.getByText('Continue'));

    const checkboxes = screen.getAllByTestId('bcgov-checkbox');
    expect(checkboxes).toHaveLength(2);

    // Toggle single item on and off
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();

    // Select All
    const selectAllBtn = screen.getByText('Select All');
    fireEvent.click(selectAllBtn);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    // Clear All
    const clearAllBtn = screen.getByText('Clear All');
    fireEvent.click(clearAllBtn);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('handles step navigation backward from Step 1 to Step 0', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '101' },
    });
    fireEvent.click(screen.getByText('Continue'));

    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Select asset type')).toBeInTheDocument();
  });

  it('validates form field changes and enables Review button in Step 1', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    // Navigate to Step 1
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '101' },
    });
    fireEvent.click(screen.getByText('Continue'));

    // Select at least one asset
    const checkboxes = screen.getAllByTestId('bcgov-checkbox');
    fireEvent.click(checkboxes[0]);

    const reviewBtn = screen.getByText('Review');
    expect(reviewBtn).toBeDisabled(); // Disabled until a field value is changed

    // Fill fields
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '12' } }); // Length
    fireEvent.change(inputs[1], { target: { value: '6' } }); // Width
    fireEvent.change(inputs[2], { target: { value: '72' } }); // Area
    fireEvent.change(inputs[3], { target: { value: '1200' } }); // Actual Value

    // Select campsite
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '10' } });

    expect(reviewBtn).not.toBeDisabled();
  });

  it('executes full submission pipeline at Step 2 with all fields updated', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    // Step 0 -> Step 1
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '101' },
    });
    fireEvent.click(screen.getByText('Continue'));

    // Step 1: Select all assets and fill inputs
    fireEvent.click(screen.getByText('Select All'));

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '15' } });
    fireEvent.change(inputs[1], { target: { value: '8' } });
    fireEvent.change(inputs[2], { target: { value: '120' } });
    fireEvent.change(inputs[3], { target: { value: '2500' } });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '10' } });

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('Review'));
    expect(screen.getByText('Review your changes')).toBeInTheDocument();

    // Verify Step 2 rendered updated items
    expect(screen.getByText(/Shelter Alpha 1/i)).toBeInTheDocument();

    // Submit Step 2
    const submitBtn = screen.getByRole('button', { name: /update 2 assets/i });
    fireEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith({
      recreationAssetBulkUpdateDto: {
        rec_resource_id: 'rec-123',
        asset_ids: [1, 2],
        update_fields: {
          asset_length: 15,
          asset_width: 8,
          asset_area: 120,
          actual_value: 2500,
          parent_id: 10,
        },
      },
    });

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders review screen correctly for campsite branches and text fallbacks', () => {
    render(<BulkAssetEditModal {...defaultProps} />);

    // Step 0
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '101' },
    });
    fireEvent.click(screen.getByText('Continue'));

    // Select asset 2 (which contains nulls for existing values)
    const checkboxes = screen.getAllByTestId('bcgov-checkbox');
    fireEvent.click(checkboxes[1]);

    // Test non-digit string campsite name (Site-B)
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '20' } });

    fireEvent.click(screen.getByText('Review'));

    // Verify 'Update 1 asset' singular string rendering
    expect(screen.getByText('Update 1 asset')).toBeInTheDocument();
    expect(screen.getByText('Site-B')).toBeInTheDocument();
  });
});
