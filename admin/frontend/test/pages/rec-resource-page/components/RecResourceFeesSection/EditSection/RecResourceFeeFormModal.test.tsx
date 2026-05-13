import { RecResourceFeeFormModal } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeFormModal';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAddSuccessNotification = vi.fn();
vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
}));

const mockDeleteFeeMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock('@/services', () => ({
  useDeleteFee: () => mockDeleteFeeMutation,
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeForm',
  () => ({
    RecResourceFeeForm: ({ showDeleteAction, onDelete }: any) => (
      <>
        <div data-testid="fee-form" />
        {showDeleteAction && (
          <button type="button" onClick={onDelete}>
            Delete Fee
          </button>
        )}
      </>
    ),
  }),
);

describe('RecResourceFeeFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(
      screen.getByRole('button', { name: 'Delete Fee' }),
    ).toBeInTheDocument();
  });

  it('opens delete confirmation from edit modal', async () => {
    const user = userEvent.setup();

    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="edit"
        initialFee={{ fee_id: 123, recreation_fee_code: 'D' } as any}
        onClose={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete Fee' }));

    expect(screen.getByText('Delete this fee?')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Deleting this fee will immediately remove it from RecSpace/i,
      ),
    ).toBeInTheDocument();
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

  it('canceling the delete confirmation modal closes it without deleting', async () => {
    const user = userEvent.setup();

    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="edit"
        initialFee={{ fee_id: 123, recreation_fee_code: 'D' } as any}
        onClose={() => {}}
      />,
    );

    // Open delete confirmation
    await user.click(screen.getByRole('button', { name: 'Delete Fee' }));
    expect(screen.getByText('Delete this fee?')).toBeInTheDocument();

    // Click Cancel
    const deleteConfirmModal = document.querySelector(
      '.delete-fee-confirmation-modal',
    )!;
    await user.click(
      within(deleteConfirmModal as HTMLElement).getByRole('button', {
        name: /cancel/i,
      }),
    );

    expect(screen.queryByText('Delete this fee?')).not.toBeInTheDocument();
    expect(mockDeleteFeeMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('confirming delete calls mutateAsync, closes modal and shows success notification', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockDeleteFeeMutation.mutateAsync.mockResolvedValueOnce(undefined);

    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="edit"
        initialFee={{ fee_id: 123, recreation_fee_code: 'D' } as any}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete Fee' }));
    const deleteConfirmModal1 = document.querySelector(
      '.delete-fee-confirmation-modal',
    )!;
    await user.click(
      within(deleteConfirmModal1 as HTMLElement).getByRole('button', {
        name: /delete fee/i,
      }),
    );

    await waitFor(() => {
      expect(mockDeleteFeeMutation.mutateAsync).toHaveBeenCalledWith({
        recResourceId: 'REC1',
        feeId: 123,
      });
    });

    expect(onClose).toHaveBeenCalled();
    expect(mockAddSuccessNotification).toHaveBeenCalledWith(
      'Fee deleted successfully',
      'deleteFee-success',
    );

    // Confirmation modal should be closed
    expect(screen.queryByText('Delete this fee?')).not.toBeInTheDocument();
  });

  it('handleDelete does nothing when initialFee has no fee_id', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <RecResourceFeeFormModal
        recResourceId="REC1"
        mode="edit"
        initialFee={{ fee_id: undefined, recreation_fee_code: 'D' } as any}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete Fee' }));
    const deleteConfirmModal2 = document.querySelector(
      '.delete-fee-confirmation-modal',
    )!;
    await user.click(
      within(deleteConfirmModal2 as HTMLElement).getByRole('button', {
        name: /delete fee/i,
      }),
    );

    await waitFor(() => {
      expect(mockDeleteFeeMutation.mutateAsync).not.toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(mockAddSuccessNotification).not.toHaveBeenCalled();
  });
});
