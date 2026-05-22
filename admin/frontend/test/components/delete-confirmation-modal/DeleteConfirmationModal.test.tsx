import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('DeleteConfirmationModal', () => {
  it('does not render when show is false', () => {
    render(
      <DeleteConfirmationModal
        show={false}
        title="Delete fee?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.queryByText('Delete fee?')).not.toBeInTheDocument();
  });

  it('renders title, description, children and default actions', () => {
    render(
      <DeleteConfirmationModal
        show
        title="Delete this fee?"
        description="Delete message"
        onCancel={() => {}}
        onConfirm={() => {}}
      >
        <div>Extra content</div>
      </DeleteConfirmationModal>,
    );

    expect(screen.getByText('Delete this fee?')).toBeInTheDocument();
    expect(screen.getByText('Delete message')).toBeInTheDocument();
    expect(screen.getByText('Extra content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^delete$/i }),
    ).toBeInTheDocument();
  });

  it('calls onCancel and onConfirm when action buttons are clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmationModal
        show
        title="Delete this fee?"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows deleting state by disabling confirm button and hiding icon', () => {
    render(
      <DeleteConfirmationModal
        show
        title="Delete this fee?"
        isDeleting
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /deleting/i });
    expect(confirmButton).toBeDisabled();
    expect(confirmButton.querySelector('svg')).toBeNull();
  });

  it('applies custom modal class name', () => {
    render(
      <DeleteConfirmationModal
        show
        title="Delete this fee?"
        className="custom-delete-modal"
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(document.querySelector('.custom-delete-modal')).toBeInTheDocument();
  });
});
