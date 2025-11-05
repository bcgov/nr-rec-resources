import { EstablishmentOrderDeleteModal } from '@/pages/rec-resource-page/components/RecResourceEstablishmentOrderSection/EstablishmentOrderDeleteModal';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFile: GalleryFile = {
  id: 'test-doc-1',
  name: 'Test Establishment Order.pdf',
  date: '2024-01-15',
  url: 'https://example.com/test-establishment-order.pdf',
  extension: 'pdf',
  type: 'document',
};

const mockOnCancel = vi.fn();
const mockOnConfirm = vi.fn();

describe('EstablishmentOrderDeleteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when not shown', () => {
    const { container } = render(
      <EstablishmentOrderDeleteModal
        show={false}
        file={mockFile}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
      />,
      { wrapper: TestQueryClientProvider },
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no file', () => {
    const { container } = render(
      <EstablishmentOrderDeleteModal
        show={true}
        file={null}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
      />,
      { wrapper: TestQueryClientProvider },
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders with correct content', () => {
    render(
      <EstablishmentOrderDeleteModal
        show={true}
        file={mockFile}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
      />,
      { wrapper: TestQueryClientProvider },
    );

    expect(screen.getByText('Delete establishment order')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Deleting this establishment order document is permanent and cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete this establishment order?/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Test Establishment Order.pdf').length,
    ).toBeGreaterThan(0);
  });

  it('calls onCancel when Cancel button clicked', () => {
    render(
      <EstablishmentOrderDeleteModal
        show={true}
        file={mockFile}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
      />,
      { wrapper: TestQueryClientProvider },
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete button clicked', () => {
    render(
      <EstablishmentOrderDeleteModal
        show={true}
        file={mockFile}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
      />,
      { wrapper: TestQueryClientProvider },
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when close button clicked', () => {
    render(
      <EstablishmentOrderDeleteModal
        show={true}
        file={mockFile}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
      />,
      { wrapper: TestQueryClientProvider },
    );

    fireEvent.click(screen.getByLabelText(/close/i));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
