import {
  buildRepairMutationDto,
  EMPTY_REPAIR_FORM,
  getRepairTitle,
  parseOptionalRepairNumber,
  RepairAddForm,
  RepairExpandToggle,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/repairShared';
import type {
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const repairCodes: RepairCode[] = [
  { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
];

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

describe('repairShared', () => {
  it('parses optional repair numbers', () => {
    expect(parseOptionalRepairNumber('')).toBeNull();
    expect(parseOptionalRepairNumber('12.5')).toBe(12.5);
  });

  it('builds repair mutation dto from form state', () => {
    expect(
      buildRepairMutationDto({
        repairCode: 'R1',
        estimatedCost: '10.1',
        actualCost: '',
        completedDate: '2026-09-01',
      }),
    ).toEqual({
      recreation_remed_repair_code: 'R1',
      estimated_repair_cost: 10.1,
      actual_repair_cost: null,
      repair_completed_date: '2026-09-01',
    });
  });

  it('returns null title when no repair code description matches', () => {
    expect(
      getRepairTitle(
        buildRepair({ recreation_remed_repair_code: 'UNKNOWN' }),
        repairCodes,
      ),
    ).toBeNull();
  });

  it('renders expand toggle state and fires onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <RepairExpandToggle isExpanded={false} onToggle={onToggle} />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<RepairExpandToggle isExpanded onToggle={onToggle} />);
    expect(
      screen.getByRole('button', { name: 'Hide repairs' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('disables save in add form until repair type is selected', async () => {
    const user = userEvent.setup();
    const onFormChange = vi.fn();
    const onSave = vi.fn();

    render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={EMPTY_REPAIR_FORM}
        isCreating={false}
        onFormChange={onFormChange}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    const saveButton = screen.getByRole('button', { name: 'Save repair' });
    expect(saveButton).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Repair type'), 'R1');
    expect(onFormChange).toHaveBeenCalledWith({ repairCode: 'R1' });
  });
});
