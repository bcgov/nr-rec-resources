import { EstablishmentOrderUploadModal } from '@/pages/rec-resource-page/components/RecResourceEstablishmentOrderSection/EstablishmentOrderUploadModal';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { reactQueryWrapper } from '@test/test-utils/reactQueryWrapper';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFile: GalleryFile = {
  id: 'temp-123',
  name: 'test-establishment-order.pdf',
  date: '2024-01-15',
  url: 'blob:http://localhost/test-url',
  extension: 'pdf',
  type: 'document',
  pendingFile: new File(['test content'], 'test-establishment-order.pdf', {
    type: 'application/pdf',
  }),
};

const mockOnCancel = vi.fn();
const mockOnConfirm = vi.fn();
const mockOnFileNameChange = vi.fn();

describe('EstablishmentOrderUploadModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when not shown', () => {
    const { container } = render(
      <EstablishmentOrderUploadModal
        show={false}
        file={mockFile}
        fileName="test"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no file', () => {
    const { container } = render(
      <EstablishmentOrderUploadModal
        show={true}
        file={null}
        fileName="test"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders with correct content', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="test-establishment-order"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    expect(screen.getByText('Upload establishment order')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('test-establishment-order'),
    ).toBeInTheDocument();
  });

  it('calls onFileNameChange when filename changes', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="test"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(mockOnFileNameChange).toHaveBeenCalledWith('New Name');
  });

  it('shows validation error when provided', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="invalid"
        fileNameError="File name already exists"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    expect(screen.getByText('File name already exists')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('is-invalid');
  });

  it('disables upload button when filename has error', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="invalid"
        fileNameError="Error"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it('calls onCancel when Cancel button clicked', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="test"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Upload button clicked', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="test"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('calls onConfirm when form submitted with valid filename', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="test"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    const form = screen.getByRole('textbox').closest('form');
    if (form) {
      fireEvent.submit(form);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onConfirm when form submitted with invalid filename', () => {
    render(
      <EstablishmentOrderUploadModal
        show={true}
        file={mockFile}
        fileName="invalid"
        fileNameError="Error"
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        onFileNameChange={mockOnFileNameChange}
      />,
      { wrapper: reactQueryWrapper },
    );

    const form = screen.getByRole('textbox').closest('form');
    if (form) {
      fireEvent.submit(form);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    }
  });
});
