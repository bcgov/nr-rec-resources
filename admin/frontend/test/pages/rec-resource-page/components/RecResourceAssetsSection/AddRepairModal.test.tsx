import { AddRepairModal } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AddRepairModal';
import type {
  Asset,
  AssetCode,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { useBulkInsertAssetRepairs } from '@/services/hooks/recreation-resource-admin';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/hooks/recreation-resource-admin', () => ({
  useBulkInsertAssetRepairs: vi.fn(),
}));

const REC_RESOURCE_ID = 'REC0001';

const repairCodes: RepairCode[] = [
  { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
  { recreation_remed_repair_code: 'R2', description: 'Deck repair' },
];

const assetCodes: AssetCode[] = [
  { asset_code: 1, description: 'Picnic table' },
  { asset_code: 2, description: 'Toilet' },
];

const assets: Asset[] = [
  {
    asset_id: 1,
    parent_id: null,
    rec_resource_id: REC_RESOURCE_ID,
    asset_code: 1,
    asset_name: 'Picnic table 1',
    asset_tag: null,
    asset_comment: null,
    legacy_structure_id: null,
    asset_length: null,
    asset_width: null,
    asset_area: null,
    default_value: null,
    actual_value: null,
    installation_date: null,
    updated_by: null,
    updated_at: null,
    geometry_type_code: null,
    latitude: null,
    longitude: null,
    recreation_asset_repair: null,
  },
];

// Selects the first asset type in a RepairAssetEntry and checks the asset
// that reveals, which is what's required to make "Create repairs" clickable.
const selectAssetAndCheckIt = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(screen.getByRole('combobox', { name: 'Asset type' }));
  await user.click(screen.getByRole('option', { name: 'Picnic table' }));
  await user.click(screen.getByRole('checkbox', { name: 'Picnic table 1' }));
};

describe('AddRepairModal', () => {
  // Synchronously invokes the per-call onSuccess callback, mirroring what a
  // successful real mutation would do, so submit-success behaviour is testable.
  const mutate = vi.fn((_variables, options) => {
    options?.onSuccess?.();
  });

  beforeEach(() => {
    mutate.mockClear();
    vi.mocked(useBulkInsertAssetRepairs).mockReturnValue({
      mutate,
      isPending: false,
    } as any);
  });

  it('does not render modal content when show is false', () => {
    render(
      <AddRepairModal
        show={false}
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={[]}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.queryByText('Add repair')).not.toBeInTheDocument();
  });

  it('renders the title and repair type options, sorted alphabetically, when shown', async () => {
    const user = userEvent.setup();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={[]}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByText('Add repair')).toBeInTheDocument();
    expect(screen.getByText('Repair details')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Repair type' }));

    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Deck repair',
      'Paint touch-up',
    ]);
  });

  it('renders no repair type options when repairCodes is empty', async () => {
    const user = userEvent.setup();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={[]}
        assetCodes={assetCodes}
        assets={[]}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Repair type' }));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No options')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={[]}
        onCancel={onCancel}
        onCreate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables Create repairs until an asset is selected', async () => {
    const user = userEvent.setup();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={assets}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Create repairs' }),
    ).toBeDisabled();

    await selectAssetAndCheckIt(user);

    expect(
      screen.getByRole('button', { name: 'Create repairs' }),
    ).not.toBeDisabled();
  });

  it('shows validation errors and does not submit when required fields are missing', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={assets}
        onCancel={vi.fn()}
        onCreate={onCreate}
      />,
    );

    await selectAssetAndCheckIt(user);
    await user.click(screen.getByRole('button', { name: 'Create repairs' }));

    expect(mutate).not.toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.getByText('Repair type is required')).toBeInTheDocument();
    expect(
      screen.getByText('Estimated repair cost is required'),
    ).toBeInTheDocument();
  });

  it('submits the built payload and calls onCreate when all required fields are filled', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={assets}
        onCancel={vi.fn()}
        onCreate={onCreate}
      />,
    );

    await selectAssetAndCheckIt(user);

    await user.click(screen.getByRole('combobox', { name: 'Repair type' }));
    await user.click(screen.getByRole('option', { name: 'Paint touch-up' }));

    await user.type(
      screen.getByLabelText('Estimated repair cost per asset'),
      '100',
    );

    await user.click(screen.getByRole('button', { name: 'Create repairs' }));

    expect(mutate).toHaveBeenCalledTimes(1);
    const [variables] = mutate.mock.calls[0];
    expect(variables).toEqual({
      recResourceId: REC_RESOURCE_ID,
      dto: {
        recreation_remed_repair_code: 'R1',
        completed_date: undefined,
        changes: [
          {
            estimated_repair_cost: 100,
            actual_repair_cost: undefined,
            asset_ids: [1],
          },
        ],
      },
    });
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('disables the footer buttons while the mutation is pending', () => {
    vi.mocked(useBulkInsertAssetRepairs).mockReturnValue({
      mutate,
      isPending: true,
    } as any);

    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={assets}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Creating repairs...' }),
    ).toBeDisabled();
  });

  it('calls onCancel when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AddRepairModal
        show
        recResourceId={REC_RESOURCE_ID}
        repairCodes={repairCodes}
        assetCodes={assetCodes}
        assets={[]}
        onCancel={onCancel}
        onCreate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
