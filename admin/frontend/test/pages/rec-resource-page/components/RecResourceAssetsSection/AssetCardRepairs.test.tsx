import { AssetCardRepairs } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardRepairs';
import * as useUpdateRepairModule from '@/services/hooks/recreation-resource-admin/useUpdateRepair';
import * as useAuthorizationsModule from '@/hooks/useAuthorizations';
import type {
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/hooks/recreation-resource-admin/useUpdateRepair', () => ({
  useUpdateRepair: vi.fn(),
}));

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: vi.fn(),
}));

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

const mockUpdateRepair = vi.fn();

describe('AssetCardRepairs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateRepairModule.useUpdateRepair).mockReturnValue({
      mutate: mockUpdateRepair,
    } as any);
    vi.mocked(useAuthorizationsModule.useAuthorizations).mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
    });
  });

  it('starts collapsed, showing "Show repairs"', () => {
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This asset has no repairs'),
    ).not.toBeInTheDocument();
  });

  it('expands to show repairs on click', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(
      screen.getByRole('button', { name: 'Hide repairs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
  });

  it('collapses again on second click', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    const toggle = screen.getByRole('button', { name: 'Show repairs' });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Hide repairs' }));

    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This asset has no repairs'),
    ).not.toBeInTheDocument();
  });

  it('renders repairs whose code resolves to a known description', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairs
        repairs={[buildRepair({ recreation_remed_repair_code: 'R1' })]}
        repairCodes={repairCodes}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('Paint touch-up')).toBeInTheDocument();
  });

  it('excludes repairs whose code does not resolve to a known description', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairs
        repairs={[buildRepair({ recreation_remed_repair_code: 'UNKNOWN' })]}
        repairCodes={repairCodes}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
  });

  it('renders repair fields: estimated cost, actual cost, completed date', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairs
        repairs={[
          buildRepair({
            estimated_repair_cost: 200,
            actual_repair_cost: 250,
            repair_completed_date: '2024-03-10',
          }),
        ]}
        repairCodes={repairCodes}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
    expect(screen.getByText(/Mar 10, 2024/)).toBeInTheDocument();
  });

  it('renders the Add repair button', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(
      screen.getByRole('button', { name: /Add repair/ }),
    ).toBeInTheDocument();
  });

  describe('editing mode (RepairEditRow)', () => {
    it('shows an empty-repairs message when isEditing and no repairs', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairs
          repairs={[]}
          repairCodes={repairCodes}
          isEditing
          recResourceId="REC0001"
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
    });

    it('renders editable fields for each repair when isEditing', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairs
          repairs={[
            buildRepair({ repair_id: 1, recreation_remed_repair_code: 'R1' }),
          ]}
          repairCodes={repairCodes}
          isEditing
          recResourceId="REC0001"
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      expect(screen.getByLabelText('Repair type')).toBeInTheDocument();
      expect(screen.getByLabelText('Estimated cost')).toBeInTheDocument();
      expect(screen.getByLabelText('Actual cost')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed date')).toBeInTheDocument();
    });

    it('calls updateRepair with correct dto on blur when recResourceId is provided', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairs
          repairs={[
            buildRepair({
              repair_id: 5,
              recreation_remed_repair_code: 'R1',
              estimated_repair_cost: 100,
            }),
          ]}
          repairCodes={repairCodes}
          isEditing
          recResourceId="REC0001"
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      const estimatedInput = screen.getByLabelText('Estimated cost');
      await user.clear(estimatedInput);
      await user.type(estimatedInput, '200');
      await user.tab(); // trigger onBlur

      expect(mockUpdateRepair).toHaveBeenCalledWith(
        expect.objectContaining({
          repairId: 5,
          recResourceId: 'REC0001',
          dto: expect.objectContaining({
            estimated_repair_cost: 200,
          }),
        }),
      );
    });

    it('does not call updateRepair on blur when recResourceId is not provided', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairs
          repairs={[buildRepair({ repair_id: 5 })]}
          repairCodes={repairCodes}
          isEditing
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      const estimatedInput = screen.getByLabelText('Estimated cost');
      await user.click(estimatedInput);
      await user.tab();

      expect(mockUpdateRepair).not.toHaveBeenCalled();
    });
  });
});
