import { RecResourceFeeFormModal } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeFormModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeForm',
  () => ({
    RecResourceFeeForm: () => <div data-testid="fee-form" />,
  }),
);

describe('RecResourceFeeFormModal', () => {
  it('shows Add Fee title in create mode', () => {
    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="create"
        onClose={() => {}}
      />,
    );

    expect(screen.getByText('Add Fee')).toBeInTheDocument();
    expect(screen.getByTestId('fee-form')).toBeInTheDocument();
  });

  it('shows Edit Fee title in edit mode', () => {
    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="edit"
        initialFee={{ fee_id: 123 } as any}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText('Edit Fee')).toBeInTheDocument();
    expect(screen.getByTestId('fee-form')).toBeInTheDocument();
  });

  it('shows Fee not found when edit mode has no initialFee', () => {
    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="edit"
        onClose={() => {}}
      />,
    );

    expect(screen.getByText('Edit Fee')).toBeInTheDocument();
    expect(screen.getByText('Fee not found.')).toBeInTheDocument();
    expect(screen.queryByTestId('fee-form')).not.toBeInTheDocument();
  });

  it('wires modal close to onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="create"
        onClose={onClose}
      />,
    );

    // react-bootstrap Modal close button renders as a button (with aria-label "Close")
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
