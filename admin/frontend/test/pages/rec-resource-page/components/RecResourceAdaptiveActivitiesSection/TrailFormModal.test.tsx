import { TrailFormModal } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailFormModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailForm',
  () => ({
    TrailForm: ({ mode, onDone }: { mode: string; onDone: () => void }) => (
      <div data-testid="trail-form">
        <span data-testid="form-mode">{mode}</span>
        <button onClick={onDone}>Done</button>
      </div>
    ),
  }),
);

describe('TrailFormModal', () => {
  const defaultProps = {
    recResourceId: 'REC0001',
    activityCode: 34,
    onClose: vi.fn(),
  };

  it('shows "Add trail" as the title in create mode', () => {
    render(<TrailFormModal {...defaultProps} mode="create" />);
    expect(screen.getByText('Add trail')).toBeInTheDocument();
  });

  it('shows "Edit trail" as the title in edit mode', () => {
    render(<TrailFormModal {...defaultProps} mode="edit" />);
    expect(screen.getByText('Edit trail')).toBeInTheDocument();
  });

  it('renders TrailForm inside the modal body', () => {
    render(<TrailFormModal {...defaultProps} mode="create" />);
    expect(screen.getByTestId('trail-form')).toBeInTheDocument();
  });

  it('passes create mode to TrailForm', () => {
    render(<TrailFormModal {...defaultProps} mode="create" />);
    expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
  });

  it('passes edit mode to TrailForm', () => {
    render(<TrailFormModal {...defaultProps} mode="edit" />);
    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
  });

  it('calls onClose when TrailForm signals done', () => {
    const onClose = vi.fn();
    render(
      <TrailFormModal {...defaultProps} mode="create" onClose={onClose} />,
    );

    fireEvent.click(screen.getByText('Done'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders modal content when show defaults to true', () => {
    render(<TrailFormModal {...defaultProps} mode="create" />);
    expect(screen.getByTestId('trail-form')).toBeInTheDocument();
  });

  it('does not render modal content when show is false', () => {
    render(<TrailFormModal {...defaultProps} mode="create" show={false} />);
    expect(screen.queryByTestId('trail-form')).not.toBeInTheDocument();
  });
});
