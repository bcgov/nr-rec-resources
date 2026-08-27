import { AssetCardRepairsEdit } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardRepairsEdit';
import * as useUpdateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair';
import * as useCreateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useCreateAssetRepair';
import type {
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair',
  () => ({
    useUpdateAssetRepair: vi.fn(),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/useCreateAssetRepair',
  () => ({
    useCreateAssetRepair: vi.fn(),
  }),
);

const buildRepair = (overrides: Partial<AssetRepair> = {}): AssetRepair => ({
  repair_id: 1,
  asset_id: 10,
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
  { recreation_remed_repair_code: 'R2', description: 'Structural fix' },
];

const mockUpdateRepair = vi.fn();
const mockCreateRepair = vi.fn();

const defaultProps = {
  repairs: [],
  repairCodes,
  recResourceId: 'REC001',
  assetId: 10,
};

describe('AssetCardRepairsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAssetRepairModule.useUpdateAssetRepair).mockReturnValue({
      mutate: mockUpdateRepair,
    } as any);
    vi.mocked(useCreateAssetRepairModule.useCreateAssetRepair).mockReturnValue({
      mutate: mockCreateRepair,
      isPending: false,
    } as any);
  });

  it('starts collapsed showing "Show repairs" button', () => {
    render(<AssetCardRepairsEdit {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This asset has no repairs'),
    ).not.toBeInTheDocument();
  });

  it('expands to show empty state when no repairs', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(
      screen.getByRole('button', { name: 'Hide repairs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
  });

  it('collapses again on second toggle click', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));
    await user.click(screen.getByRole('button', { name: 'Hide repairs' }));

    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
  });

  it('renders repair title and edit fields for each visible repair', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 1, estimated_repair_cost: 150 })]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('Paint touch-up')).toBeInTheDocument();
    expect(screen.getByLabelText('Estimated cost')).toBeInTheDocument();
    expect(screen.getByLabelText('Actual cost')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed date')).toBeInTheDocument();
  });

  it('hides repairs whose code has no matching description', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[
          buildRepair({
            repair_id: 1,
            recreation_remed_repair_code: 'UNKNOWN',
          }),
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
  });

  it('calls updateRepair with parsed number when estimated cost blurs', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 3 })]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const estimatedInput = screen.getByLabelText('Estimated cost');
    await user.clear(estimatedInput);
    await user.type(estimatedInput, '300');
    await user.tab();

    expect(mockUpdateRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        repairId: 3,
        recResourceId: 'REC001',
        dto: { estimated_repair_cost: 300 },
      }),
    );
  });

  it('calls updateRepair with null when estimated cost blurred empty', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 3, estimated_repair_cost: 100 })]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const estimatedInput = screen.getByLabelText('Estimated cost');
    await user.clear(estimatedInput);
    await user.tab();

    expect(mockUpdateRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        dto: { estimated_repair_cost: null },
      }),
    );
  });

  it('calls updateRepair with null when date blurred empty', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 3 })]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const dateInput = screen.getByLabelText('Completed date');
    await user.click(dateInput);
    await user.tab();

    expect(mockUpdateRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        dto: { repair_completed_date: null },
      }),
    );
  });

  it('sorts repairs by repair_id ascending', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[
          buildRepair({ repair_id: 2, recreation_remed_repair_code: 'R2' }),
          buildRepair({ repair_id: 1, recreation_remed_repair_code: 'R1' }),
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const titles = screen
      .getAllByText(/Paint touch-up|Structural fix/)
      .map((el) => el.textContent);
    expect(titles).toEqual(['Paint touch-up', 'Structural fix']);
  });

  it('shows Add repair button when expanded', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(
      screen.getByRole('button', { name: /Add repair/ }),
    ).toBeInTheDocument();
  });

  it('shows the add form when Add repair is clicked and hides the button', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));
    await user.click(screen.getByRole('button', { name: /Add repair/ }));

    expect(screen.getByLabelText('Repair type')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Add repair/ }),
    ).not.toBeInTheDocument();
  });

  it('hides the add form and shows Add repair button after Cancel', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));
    await user.click(screen.getByRole('button', { name: /Add repair/ }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.getByRole('button', { name: /Add repair/ }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Repair type')).not.toBeInTheDocument();
  });

  it('calls createRepair with correct dto when Save repair is clicked', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));
    await user.click(screen.getByRole('button', { name: /Add repair/ }));

    // Select a repair type to enable save
    const repairTypeSelect = screen.getByLabelText('Repair type');
    await user.selectOptions(repairTypeSelect, 'R1');

    await user.click(screen.getByRole('button', { name: /Save repair/ }));

    expect(mockCreateRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId: 10,
        recResourceId: 'REC001',
        dto: expect.objectContaining({
          recreation_remed_repair_code: 'R1',
          estimated_repair_cost: null,
          actual_repair_cost: null,
          repair_completed_date: null,
        }),
      }),
      expect.any(Object),
    );
  });

  it('hides add form and resets after successful save', async () => {
    const user = userEvent.setup();
    // Make createRepair call onSuccess immediately
    vi.mocked(useCreateAssetRepairModule.useCreateAssetRepair).mockReturnValue({
      mutate: (_vars: any, opts: any) => opts?.onSuccess?.(),
      isPending: false,
    } as any);

    render(<AssetCardRepairsEdit {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));
    await user.click(screen.getByRole('button', { name: /Add repair/ }));

    const repairTypeSelect = screen.getByLabelText('Repair type');
    await user.selectOptions(repairTypeSelect, 'R1');
    await user.click(screen.getByRole('button', { name: /Save repair/ }));

    // Form should be hidden and button restored
    expect(
      screen.getByRole('button', { name: /Add repair/ }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Repair type')).not.toBeInTheDocument();
  });
});
