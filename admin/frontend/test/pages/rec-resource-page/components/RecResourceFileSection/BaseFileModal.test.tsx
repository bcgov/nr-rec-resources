import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-object-url'),
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, size, color, className }: any) => (
    <div
      data-testid="font-awesome-icon"
      data-icon={icon.iconName || 'mocked-icon'}
      data-size={size}
      data-color={color}
      className={className}
    />
  ),
}));
vi.mock('@/components', () => ({
  ClampLines: ({ text }: any) => <div>{text}</div>,
}));

describe('BaseFileModal', () => {
  const mockHandlers = {
    onHide: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  const documentFile: GalleryFile = {
    id: 'doc-1',
    name: 'test.pdf',
    date: '2023-01-01',
    url: 'https://example.com/test.pdf',
    extension: 'pdf',
    type: 'document',
  };

  const imageFile: GalleryFile = {
    id: 'img-1',
    name: 'test.jpg',
    date: '2023-01-01',
    url: 'https://example.com/test.jpg',
    extension: 'jpg',
    type: 'image',
  };

  const defaultProps = {
    show: true,
    title: 'Test Modal',
    galleryFile: documentFile,
    confirmButtonText: 'Confirm',
    confirmButtonIcon: faUpload,
    ...mockHandlers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Visibility', () => {
    it('shows/hides modal and renders content correctly', () => {
      const { rerender } = render(
        <BaseFileModal {...defaultProps} title="Custom" className="custom">
          <div data-testid="content">Content</div>
        </BaseFileModal>,
        { wrapper: TestQueryClientProvider },
      );

      // Modal visibility and content
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveClass('base-file-modal');

      // Hide modal
      rerender(<BaseFileModal {...defaultProps} show={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('File Previews', () => {
    it('renders correct preview based on file type', () => {
      // Test image preview
      render(<BaseFileModal {...defaultProps} galleryFile={imageFile} />, {
        wrapper: TestQueryClientProvider,
      });

      expect(screen.getByText('Preview')).toBeInTheDocument();
      const preview = screen.getByAltText('preview');
      expect(preview).toHaveAttribute('src', imageFile.url);
      expect(preview).toHaveClass('base-file-modal__preview-img');

      // Test document preview
      render(
        <BaseFileModal
          {...defaultProps}
          galleryFile={{ ...documentFile, name: 'doc.pdf' }}
        />,
        { wrapper: TestQueryClientProvider },
      );

      const pdfIcon = screen
        .getAllByTestId('font-awesome-icon')
        .find((icon) => icon.getAttribute('data-icon') === 'file-pdf');

      expect(pdfIcon).toHaveAttribute('data-size', '3x');
      expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    });
  });

  describe('Alerts and Interactions', () => {
    it('handles alerts and button interactions', () => {
      const alerts = [
        {
          variant: 'info' as const,
          icon: faTrash,
          text: 'Warning message',
        },
      ];

      render(
        <BaseFileModal
          {...defaultProps}
          alerts={alerts}
          confirmButtonText="Delete"
          confirmButtonIcon={faTrash}
          confirmButtonVariant="danger"
        />,
        { wrapper: TestQueryClientProvider },
      );

      // Alert rendering
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('base-file-modal__alert');

      // Button interactions
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      const closeButton = screen.getByRole('button', { name: /close/i });

      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();

      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);
      fireEvent.click(closeButton);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onHide).toHaveBeenCalledTimes(1);
    });

    it('works without alert config', () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: TestQueryClientProvider,
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Edge Cases', () => {
    it('applies CSS classes and handles edge cases', () => {
      // Test CSS classes
      const { rerender } = render(
        <BaseFileModal {...defaultProps} className="custom" />,
        { wrapper: TestQueryClientProvider },
      );

      const title = screen.getByText('Test Modal');
      expect(title).toBeInTheDocument();

      // Test modal styling
      const modalDialog = screen
        .getByRole('dialog')
        .querySelector('.modal-dialog');
      expect(modalDialog).toHaveClass('modal-lg', 'modal-dialog-centered');

      // Test edge cases: empty filename and minimal props
      const emptyNameFile = { ...documentFile, name: '' };
      rerender(<BaseFileModal {...defaultProps} galleryFile={emptyNameFile} />);

      const pdfIcon = screen
        .getAllByTestId('font-awesome-icon')
        .find((icon) => icon.getAttribute('data-icon') === 'file-pdf');
      expect(pdfIcon).toBeDefined();

      // Test minimal props don't throw
      const minimalProps = {
        show: true,
        onHide: vi.fn(),
        title: 'Minimal',
        galleryFile: documentFile,
        confirmButtonText: 'OK',
      };

      expect(() =>
        render(<BaseFileModal {...minimalProps} />, {
          wrapper: TestQueryClientProvider,
        }),
      ).not.toThrow();
    });
  });
});
