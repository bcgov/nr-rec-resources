import { AssetCardRepairsEdit } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardRepairsEdit';
import * as useCreateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useCreateAssetRepair';
import type {
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('calls onRepairChange with parsed number when estimated cost blurs', async () => {
    const user = userEvent.setup();
    const onRepairChange = vi.fn();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 3 })]}
        onRepairChange={onRepairChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const estimatedInput = screen.getByLabelText('Estimated cost');
    await user.clear(estimatedInput);
    await user.type(estimatedInput, '300');
    await user.tab();

    expect(onRepairChange).toHaveBeenCalledWith(3, {
      estimated_repair_cost: 300,
    });
  });

  it('calls onRepairChange with null when estimated cost blurred empty', async () => {
    const user = userEvent.setup();
    const onRepairChange = vi.fn();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 3, estimated_repair_cost: 100 })]}
        onRepairChange={onRepairChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const estimatedInput = screen.getByLabelText('Estimated cost');
    await user.clear(estimatedInput);
    await user.tab();

    expect(onRepairChange).toHaveBeenCalledWith(3, {
      estimated_repair_cost: null,
    });
  });

  it('calls onRepairChange with null when date blurred empty', async () => {
    const user = userEvent.setup();
    const onRepairChange = vi.fn();
    render(
      <AssetCardRepairsEdit
        {...defaultProps}
        repairs={[buildRepair({ repair_id: 3 })]}
        onRepairChange={onRepairChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    const dateInput = screen.getByLabelText('Completed date');
    await user.click(dateInput);
    await user.tab();

    expect(onRepairChange).toHaveBeenCalledWith(3, {
      repair_completed_date: null,
    });
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

  describe('trail stations', () => {
    const STATION_ERROR =
      'Enter coordinates as lat,long (e.g. 49.1232,-128.3030)';

    const renderTrailRepair = (
      props: Partial<ComponentProps<typeof AssetCardRepairsEdit>> = {},
    ) =>
      render(
        <AssetCardRepairsEdit
          {...defaultProps}
          repairs={[buildRepair({ repair_id: 7 })]}
          isTrailAsset
          {...props}
        />,
      );

    it('does not render station inputs when the asset is not a trail', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairsEdit
          {...defaultProps}
          repairs={[buildRepair({ repair_id: 7 })]}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      expect(screen.queryByLabelText('Start station')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('End station')).not.toBeInTheDocument();
    });

    it('renders station inputs seeded with the saved values for a trail asset', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairsEdit
          {...defaultProps}
          repairs={[
            buildRepair({
              repair_id: 7,
              trail_segment_start: '49.232423,-128.334343',
              trail_segment_end: '49.234561,-128.331872',
            }),
          ]}
          isTrailAsset
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      expect(screen.getByLabelText('Start station')).toHaveValue(
        '49.232423,-128.334343',
      );
      expect(screen.getByLabelText('End station')).toHaveValue(
        '49.234561,-128.331872',
      );
    });

    it('renders empty station inputs when nothing is recorded', async () => {
      const user = userEvent.setup();
      renderTrailRepair();

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      expect(screen.getByLabelText('Start station')).toHaveValue('');
      expect(screen.getByLabelText('End station')).toHaveValue('');
    });

    it('calls onRepairChange with a valid start station on blur', async () => {
      const user = userEvent.setup();
      const onRepairChange = vi.fn();
      renderTrailRepair({ onRepairChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.type(
        screen.getByLabelText('Start station'),
        '49.232423,-128.334343',
      );
      await user.tab();

      expect(onRepairChange).toHaveBeenCalledWith(7, {
        trail_segment_start: '49.232423,-128.334343',
      });
    });

    it('calls onRepairChange with a valid end station on blur', async () => {
      const user = userEvent.setup();
      const onRepairChange = vi.fn();
      renderTrailRepair({ onRepairChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.type(
        screen.getByLabelText('End station'),
        '49.234561,-128.331872',
      );
      await user.tab();

      expect(onRepairChange).toHaveBeenCalledWith(7, {
        trail_segment_end: '49.234561,-128.331872',
      });
    });

    it('trims surrounding whitespace before propagating the value', async () => {
      const user = userEvent.setup();
      const onRepairChange = vi.fn();
      renderTrailRepair({ onRepairChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.type(
        screen.getByLabelText('Start station'),
        '  49.1,-128.2  ',
      );
      await user.tab();

      expect(onRepairChange).toHaveBeenCalledWith(7, {
        trail_segment_start: '49.1,-128.2',
      });
    });

    it('calls onRepairChange with null when a station is cleared', async () => {
      const user = userEvent.setup();
      const onRepairChange = vi.fn();
      render(
        <AssetCardRepairsEdit
          {...defaultProps}
          repairs={[
            buildRepair({
              repair_id: 7,
              trail_segment_start: '49.232423,-128.334343',
            }),
          ]}
          isTrailAsset
          onRepairChange={onRepairChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.clear(screen.getByLabelText('Start station'));
      await user.tab();

      expect(onRepairChange).toHaveBeenCalledWith(7, {
        trail_segment_start: null,
      });
    });

    it('shows an inline error and withholds an invalid station from the parent', async () => {
      const user = userEvent.setup();
      const onRepairChange = vi.fn();
      renderTrailRepair({ onRepairChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.type(
        screen.getByLabelText('Start station'),
        'not-a-coordinate',
      );
      await user.tab();

      expect(screen.getByText(STATION_ERROR)).toBeInTheDocument();
      expect(onRepairChange).not.toHaveBeenCalled();
    });

    it('reports the error upward so the parent can block Save', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      renderTrailRepair({ onValidationChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.type(screen.getByLabelText('Start station'), 'bad-value');
      await user.tab();

      expect(onValidationChange).toHaveBeenLastCalledWith(true);
    });

    it('clears the error and reports valid once the station is corrected', async () => {
      const user = userEvent.setup();
      const onRepairChange = vi.fn();
      const onValidationChange = vi.fn();
      renderTrailRepair({ onRepairChange, onValidationChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      const startInput = screen.getByLabelText('Start station');
      await user.type(startInput, 'bad-value');
      await user.tab();
      expect(screen.getByText(STATION_ERROR)).toBeInTheDocument();

      await user.clear(startInput);
      await user.type(startInput, '49.1,-128.2');
      await user.tab();

      expect(screen.queryByText(STATION_ERROR)).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
      expect(onRepairChange).toHaveBeenCalledWith(7, {
        trail_segment_start: '49.1,-128.2',
      });
    });

    it('keeps reporting errors while another station is still invalid', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      renderTrailRepair({ onValidationChange });

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));

      await user.type(screen.getByLabelText('Start station'), 'bad-start');
      await user.tab();

      const endInput = screen.getByLabelText('End station');
      await user.type(endInput, 'bad-end');
      await user.tab();

      // Fixing only the end station leaves the start station error standing.
      await user.clear(endInput);
      await user.type(endInput, '49.2,-128.2');
      await user.tab();

      expect(onValidationChange).toHaveBeenLastCalledWith(true);
    });

    it('does not throw when a station blurs without any callbacks wired', async () => {
      const user = userEvent.setup();
      render(
        <AssetCardRepairsEdit
          {...defaultProps}
          repairs={[buildRepair({ repair_id: 7 })]}
          isTrailAsset
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Show repairs' }));
      await user.type(screen.getByLabelText('Start station'), '49.1,-128.2');
      await user.tab();

      expect(screen.getByLabelText('Start station')).toHaveValue('49.1,-128.2');
    });
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
