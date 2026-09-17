import {
  buildRepairMutationDto,
  EMPTY_REPAIR_FORM,
  getRepairTitle,
  parseOptionalRepairNumber,
  RepairAddForm,
  RepairExpandToggle,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/repairShared';
import { STATION_COORDINATE_ERROR } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/trailStations';
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
        ...EMPTY_REPAIR_FORM,
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
      trail_segment_start: null,
      trail_segment_end: null,
    });
  });

  it('trims station coordinates into the mutation dto', () => {
    expect(
      buildRepairMutationDto({
        ...EMPTY_REPAIR_FORM,
        repairCode: 'R1',
        startStation: '  49.1232,-128.3030  ',
        endStation: '49.2000, -128.4000',
      }),
    ).toMatchObject({
      trail_segment_start: '49.1232,-128.3030',
      trail_segment_end: '49.2000, -128.4000',
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

  it('does not render station fields for non-trail assets', () => {
    render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={{ ...EMPTY_REPAIR_FORM, repairCode: 'R1' }}
        isCreating={false}
        onFormChange={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText('Start station')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('End station')).not.toBeInTheDocument();
  });

  it('renders station fields for trail assets and reports edits', async () => {
    const user = userEvent.setup();
    const onFormChange = vi.fn();

    render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={{ ...EMPTY_REPAIR_FORM, repairCode: 'R1' }}
        isCreating={false}
        isTrailAsset
        onFormChange={onFormChange}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Start station')).toBeInTheDocument();
    expect(screen.getByLabelText('End station')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Start station'), '4');
    expect(onFormChange).toHaveBeenCalledWith({ startStation: '4' });
  });

  it('saves a trail repair with the stations left empty', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={{ ...EMPTY_REPAIR_FORM, repairCode: 'R1' }}
        isCreating={false}
        isTrailAsset
        onFormChange={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save repair' }));

    expect(
      screen.queryByText(STATION_COORDINATE_ERROR),
    ).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('hides station errors until the first save attempt', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const invalidForm = {
      ...EMPTY_REPAIR_FORM,
      repairCode: 'R1',
      startStation: 'KM 0.5',
    };

    render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={invalidForm}
        isCreating={false}
        isTrailAsset
        onFormChange={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    // Blurring the field is not enough on its own.
    await user.click(screen.getByLabelText('Start station'));
    await user.tab();
    expect(
      screen.queryByText(STATION_COORDINATE_ERROR),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save repair' }));

    expect(screen.getByText(STATION_COORDINATE_ERROR)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('clears the station error once the value is corrected after a save attempt', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const baseForm = {
      ...EMPTY_REPAIR_FORM,
      repairCode: 'R1',
      startStation: 'KM 0.5',
    };

    const { rerender } = render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={baseForm}
        isCreating={false}
        isTrailAsset
        onFormChange={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save repair' }));
    expect(screen.getByText(STATION_COORDINATE_ERROR)).toBeInTheDocument();

    rerender(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={{ ...baseForm, startStation: '49.1232,-128.3030' }}
        isCreating={false}
        isTrailAsset
        onFormChange={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(
      screen.queryByText(STATION_COORDINATE_ERROR),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save repair' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('saves without error when trail stations are valid', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <RepairAddForm
        idSuffix="test"
        repairCodes={repairCodes}
        form={{
          ...EMPTY_REPAIR_FORM,
          repairCode: 'R1',
          startStation: '49.1232,-128.3030',
        }}
        isCreating={false}
        isTrailAsset
        onFormChange={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save repair' }));

    expect(
      screen.queryByText(STATION_COORDINATE_ERROR),
    ).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
