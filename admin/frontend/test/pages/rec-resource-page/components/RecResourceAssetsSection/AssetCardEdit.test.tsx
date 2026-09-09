import { AssetCardEdit } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEdit';
import type {
  Asset,
  AssetCode,
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as useUpdateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair';
import * as useCreateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useCreateAssetRepair';
import * as useDeleteAssetRepairModule from '@/services/hooks/recreation-resource-admin/useDeleteAssetRepair';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair',
  () => ({ useUpdateAssetRepair: vi.fn() }),
);
vi.mock(
  '@/services/hooks/recreation-resource-admin/useCreateAssetRepair',
  () => ({ useCreateAssetRepair: vi.fn() }),
);
vi.mock(
  '@/services/hooks/recreation-resource-admin/useDeleteAssetRepair',
  () => ({ useDeleteAssetRepair: vi.fn() }),
);

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC001',
  asset_code: 100,
  asset_name: 'My Bridge',
  asset_tag: null,
  asset_comment: null,
  legacy_structure_id: null,
  asset_length: null,
  asset_width: null,
  asset_area: null,
  actual_value: null,
  installation_date: null,
  updated_by: null,
  updated_at: null,
  geometry_type_code: null,
  latitude: null,
  longitude: null,
  recreation_asset_repair: null,
  ...overrides,
});

const buildRepair = (overrides: Partial<AssetRepair> = {}): AssetRepair => ({
  repair_id: 1,
  asset_id: 1,
  recreation_remed_repair_code: 'R1',
  estimated_repair_cost: null,
  actual_repair_cost: null,
  repair_completed_date: null,
  urgency: null,
  trail_segment_start: null,
  trail_segment_end: null,
  created_by: null,
  created_at: null,
  updated_by: null,
  updated_at: null,
  ...overrides,
});

const repairCodes: RepairCode[] = [
  { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
];

const assetCodes: AssetCode[] = [
  {
    asset_code: 100,
    description: 'Bridge',
    has_length: true,
    has_width: false,
    has_area: true,
    default_value: 2500,
  },
];

const defaultProps = {
  asset: buildAsset(),
  repairCodes,
  recResourceId: 'REC001',
  onChange: vi.fn(),
};

describe('AssetCardEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAssetRepairModule.useUpdateAssetRepair).mockReturnValue({
      mutate: vi.fn(),
    } as any);
    vi.mocked(useCreateAssetRepairModule.useCreateAssetRepair).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(useDeleteAssetRepairModule.useDeleteAssetRepair).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('renders the asset name in the card title', () => {
    render(<AssetCardEdit {...defaultProps} />);
    expect(screen.getByText('My Bridge')).toBeInTheDocument();
  });

  it('renders edit form fields', () => {
    render(<AssetCardEdit {...defaultProps} />);
    expect(screen.getByLabelText('Asset description')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
  });

  it('hides dimension fields for campsite assets', () => {
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ asset_code: 227 })}
      />,
    );
    expect(screen.queryByLabelText('Length')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
  });

  it('calls onChange with the asset id and form values when a field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AssetCardEdit {...defaultProps} onChange={onChange} />);

    const nameInput = screen.getByLabelText('Asset description');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');

    expect(onChange).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('renders the Show repairs toggle from AssetCardRepairsEdit', () => {
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ recreation_asset_repair: [buildRepair()] })}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
  });

  it('does not render repairs section when recreation_asset_repair is null', () => {
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ recreation_asset_repair: null })}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Show repairs' }),
    ).not.toBeInTheDocument();
  });

  it('applies custom className to the card', () => {
    const { container } = render(
      <AssetCardEdit {...defaultProps} className="my-custom-class" />,
    );
    expect(container.querySelector('.my-custom-class')).toBeTruthy();
  });

  it('enables or disables dimensions and shows default value from selected asset code', () => {
    render(<AssetCardEdit {...defaultProps} assetCodes={assetCodes} />);

    expect(screen.getByLabelText('Length')).toBeEnabled();
    expect(screen.getByLabelText('Width')).toBeDisabled();
    expect(screen.getByLabelText('Area')).toBeEnabled();
    expect(screen.getByDisplayValue('2500')).toBeInTheDocument();
  });

  it('reports validation state after lat/lng edits', async () => {
    const user = userEvent.setup();
    const onValidationChange = vi.fn();
    render(
      <AssetCardEdit
        {...defaultProps}
        onValidationChange={onValidationChange}
      />,
    );

    await user.type(screen.getByLabelText('Latitude'), '49.2');

    expect(onValidationChange).toHaveBeenCalledWith(1, expect.any(Boolean));
  });

  it('shows campsite delete options when linked assets exist', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ asset_code: 227, asset_name: 'Campsite 2' })}
        linkedAssetCount={2}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      screen.getByText(/will affect 2 linked assets/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Delete campsite and unassign linked assets'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Delete campsite and all linked assets'),
    ).toBeInTheDocument();
  });

  it('passes selected delete mode when confirming campsite deletion', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ asset_code: 227, asset_name: 'Campsite 2' })}
        linkedAssetCount={1}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(
      screen.getByLabelText('Delete campsite and all linked assets'),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(onDelete).toHaveBeenCalledWith(1, 'delete-with-campsite');
  });
});
