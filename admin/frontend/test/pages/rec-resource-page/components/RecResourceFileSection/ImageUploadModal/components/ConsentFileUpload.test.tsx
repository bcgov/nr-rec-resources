import { ConsentFileUpload } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/components/ConsentFileUpload';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('ConsentFileUpload', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnFileRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no file is selected', () => {
    it('renders attach file button', () => {
      render(
        <ConsentFileUpload
          file={null}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      expect(
        screen.getByRole('button', { name: /attach file/i }),
      ).toBeInTheDocument();
    });

    it('has hidden file input that accepts PDF', () => {
      render(
        <ConsentFileUpload
          file={null}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'application/pdf');
    });
  });

  describe('when a file is selected', () => {
    const mockFile = new File(['test content'], 'consent-form.pdf', {
      type: 'application/pdf',
    });

    it('displays file name and size', () => {
      render(
        <ConsentFileUpload
          file={mockFile}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      expect(screen.getByText('consent-form.pdf')).toBeInTheDocument();
      expect(screen.getByText(/KB/)).toBeInTheDocument();
    });

    it('shows remove button', () => {
      render(
        <ConsentFileUpload
          file={mockFile}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      expect(
        screen.getByRole('button', { name: /remove consent form/i }),
      ).toBeInTheDocument();
    });

    it('calls onFileRemove when remove button is clicked', () => {
      render(
        <ConsentFileUpload
          file={mockFile}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: /remove consent form/i }),
      );

      expect(mockOnFileRemove).toHaveBeenCalled();
    });
  });

  describe('file validation', () => {
    it('rejects non-PDF files', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <ConsentFileUpload
          file={null}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const nonPdfFile = new File(['test'], 'image.jpg', {
        type: 'image/jpeg',
      });

      fireEvent.change(input, { target: { files: [nonPdfFile] } });

      expect(alertSpy).toHaveBeenCalledWith('Please select a PDF file.');
      expect(mockOnFileSelect).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('accepts PDF files', () => {
      render(
        <ConsentFileUpload
          file={null}
          onFileSelect={mockOnFileSelect}
          onFileRemove={mockOnFileRemove}
        />,
      );

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const pdfFile = new File(['test'], 'consent.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(input, { target: { files: [pdfFile] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(pdfFile);
    });
  });
});
