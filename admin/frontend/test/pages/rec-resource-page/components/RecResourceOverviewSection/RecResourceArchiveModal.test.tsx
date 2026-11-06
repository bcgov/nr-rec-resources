import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourceArchiveModal } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/RecResourceArchiveModal';

// Mock dependencies
const mockMutateAsync = vi.fn();
vi.mock(
  '@/services/hooks/recreation-resource-admin/useArchiveRecResource',
  () => ({
    useArchiveRecResource: () => ({
      mutateAsync: mockMutateAsync,
    }),
  }),
);

vi.mock('@shared/utils/capitalizeWords', () => ({
  capitalizeWords: (str: string) => `Capitalized(${str})`,
}));

describe('RecResourceArchiveModal', () => {
  const defaultProps = {
    show: true,
    recResourceId: 'res-123',
    resourceName: 'tennis court',
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when show is true', () => {
    render(<RecResourceArchiveModal {...defaultProps} />);

    // Check modal title via its class or container text
    const titleElement = document.querySelector(
      '.archive-resource-modal__title',
    );
    expect(titleElement).toHaveTextContent('Archive Resource');

    expect(
      screen.getByText('Capitalized(tennis court) (res-123) will be archived.'),
    ).toBeInTheDocument();
    expect(screen.getByText('It will:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

    // Check submit button specifically
    expect(
      screen.getByRole('button', { name: /^Archive Resource$/i }),
    ).toBeInTheDocument();
  });

  it('does not render modal content when show is false', () => {
    render(<RecResourceArchiveModal {...defaultProps} show={false} />);
    expect(
      screen.queryByRole('heading', { name: 'Archive Resource' }),
    ).not.toBeInTheDocument();
  });

  it('handles successful archive flow', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce(undefined);

    render(<RecResourceArchiveModal {...defaultProps} />);

    const archiveButton = screen.getByRole('button', {
      name: /^Archive Resource$/i,
    });
    await user.click(archiveButton);

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith({ recResourceId: 'res-123' });

    await waitFor(() => {
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  it('handles archive failure and error state flow', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));

    render(<RecResourceArchiveModal {...defaultProps} />);

    // Click archive and trigger error state
    const archiveButton = screen.getByRole('button', {
      name: /^Archive Resource$/i,
    });
    await user.click(archiveButton);

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    // Verify error UI state
    await waitFor(() => {
      expect(
        screen.getByText("Resource couldn't be archived"),
      ).toBeInTheDocument();
      expect(screen.getByText('No changes were made.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();

    // Test clicking Dismiss calls onCancel and resets error state
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('resets error state when handleCancel is called via Cancel button', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new Error('Failed'));

    const { rerender } = render(<RecResourceArchiveModal {...defaultProps} />);

    // Trigger error state
    await user.click(
      screen.getByRole('button', { name: /^Archive Resource$/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Resource couldn't be archived"),
      ).toBeInTheDocument();
    });

    // Click Dismiss (which maps to handleCancel)
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(defaultProps.onCancel).toHaveBeenCalled();

    // Re-render / simulate closing and reopening or resetting
    rerender(<RecResourceArchiveModal {...defaultProps} show={false} />);
    rerender(<RecResourceArchiveModal {...defaultProps} show={true} />);

    // Should be back to normal state
    expect(
      screen.queryByText("Resource couldn't be archived"),
    ).not.toBeInTheDocument();
    expect(screen.getByText('It will:')).toBeInTheDocument();
  });
});
