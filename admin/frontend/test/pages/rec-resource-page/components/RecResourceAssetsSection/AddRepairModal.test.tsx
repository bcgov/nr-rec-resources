import { AddRepairModal } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AddRepairModal';
import type { RepairCode } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const repairCodes: RepairCode[] = [
  { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
  { recreation_remed_repair_code: 'R2', description: 'Deck repair' },
];

describe('AddRepairModal', () => {
  it('does not render modal content when show is false', () => {
    render(
      <AddRepairModal
        show={false}
        repairCodes={repairCodes}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.queryByText('Add repair')).not.toBeInTheDocument();
  });

  it('renders the title and repair type options when shown', () => {
    render(
      <AddRepairModal
        show
        repairCodes={repairCodes}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByText('Add repair')).toBeInTheDocument();
    expect(screen.getByText('Repair details')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Paint touch-up' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Deck repair' }),
    ).toBeInTheDocument();
  });

  it('renders no repair type options when repairCodes is empty', () => {
    render(
      <AddRepairModal
        show
        repairCodes={[]}
        onCancel={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('option', { name: 'Select repair type...' }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(1);
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AddRepairModal
        show
        repairCodes={repairCodes}
        onCancel={onCancel}
        onCreate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCreate when Create repairs is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(
      <AddRepairModal
        show
        repairCodes={repairCodes}
        onCancel={vi.fn()}
        onCreate={onCreate}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Create repairs' }));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AddRepairModal
        show
        repairCodes={repairCodes}
        onCancel={onCancel}
        onCreate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
