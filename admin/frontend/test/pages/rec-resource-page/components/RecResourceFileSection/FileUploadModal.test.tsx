import { FileUploadModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal';
import * as fileTransferState from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock utility functions
vi.mock('@shared/utils', () => ({
  getFileNameWithoutExtension: vi.fn((file) => file.name.split('.')[0]),
}));

vi.mock('@/utils/imageUtils', () => ({
  isImageFile: vi.fn((file) => file.type.startsWith('image/')),
}));

// Mock BaseFileModal
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal',
  () => ({
    BaseFileModal: ({
      show,
      title,
      children,
      onCancel,
      onConfirm,
      confirmButtonText,
      confirmButtonDisabled,
    }: any) =>
      show ? (
        <div data-testid="base-file-modal">
          <div data-testid="modal-title">{title}</div>
          <div data-testid="modal-body">{children}</div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} disabled={confirmButtonDisabled}>
            {confirmButtonText}
          </button>
        </div>
      ) : null,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState',
  () => ({ useRecResourceFileTransferState: vi.fn() }),
);

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
}));

const mockHandleGeneralAction = vi.fn();
const mockUseRecResourceFileTransferState = vi.mocked(
  fileTransferState.useRecResourceFileTransferState,
);
const mockSetUploadFileName = vi.mocked(setUploadFileName);

describe('FileUploadModal', () => {
  const createFile = (
    name = 'test.png',
    fileType = 'image/png',
    galleryType: 'image' | 'document' = 'image',
  ) => ({
    id: 'test-id',
    name,
    date: '2023-01-01',
    url: '',
    extension: name.split('.').pop() || 'png',
    type: galleryType,
    pendingFile: new File(['test content'], name, { type: fileType }),
  });

  const setMockState = (state: {
    showUploadOverlay?: boolean;
    selectedFileForUpload?: any;
    uploadFileName?: string;
    fileNameError?: string | null;
  }) => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      uploadModalState: {
        showUploadOverlay: state.showUploadOverlay ?? false,
        selectedFileForUpload: state.selectedFileForUpload ?? null,
        uploadFileName: state.uploadFileName ?? '',
        fileNameError: state.fileNameError ?? null,
      },
      getDocumentGeneralActionHandler: vi.fn(
        (action) => () => mockHandleGeneralAction(action),
      ),
      getImageGeneralActionHandler: vi.fn(
        (action) => () => mockHandleGeneralAction(action),
      ),
    } as any);
  };

  const renderModal = () =>
    render(<FileUploadModal />, { wrapper: TestQueryClientProvider });

  beforeEach(() => {
    vi.clearAllMocks();
    setMockState({});
  });

  describe('Modal Visibility and Content', () => {
    it('returns null when not shown or no file selected', () => {
      setMockState({
        showUploadOverlay: false,
        selectedFileForUpload: createFile(),
      });
      expect(renderModal().container.firstChild).toBeNull();

      setMockState({ showUploadOverlay: true, selectedFileForUpload: null });
      expect(renderModal().container.firstChild).toBeNull();
    });

    it('renders with correct title based on file type', () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile('test.jpg', 'image/jpeg', 'image'),
      });
      renderModal();
      expect(screen.getByText('Upload image')).toBeInTheDocument();

      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(
          'test.pdf',
          'application/pdf',
          'document',
        ),
      });
      renderModal();
      expect(screen.getByText('Upload file')).toBeInTheDocument();
    });
  });

  describe('File Name Input', () => {
    beforeEach(() => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: 'test-file',
      });
    });

    it('displays filename, has correct attributes, and handles changes', () => {
      renderModal();
      const nameInput = screen.getByRole('textbox');

      expect(nameInput).toHaveValue('test-file');
      expect(nameInput).toHaveAttribute('maxLength', '100');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter file name');

      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      expect(mockSetUploadFileName).toHaveBeenCalledWith('New Name');
    });

    it('shows validation states correctly', () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: 'invalid',
        fileNameError: 'Error message',
      });

      renderModal();
      const nameInput = screen.getByRole('textbox');

      expect(nameInput).toHaveClass('is-invalid');
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('handles edge cases (empty/falsy errors)', () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: '',
        fileNameError: null,
      });

      renderModal();
      const nameInput = screen.getByRole('textbox');

      expect(nameInput).toHaveValue('');
      expect(nameInput).not.toHaveClass('is-invalid');
    });
  });

  describe('Actions and Form Submission', () => {
    beforeEach(() => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: 'Test File',
      });
    });

    it('handles button clicks correctly', () => {
      renderModal();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockHandleGeneralAction).toHaveBeenCalledWith('cancel-upload');

      fireEvent.click(screen.getByRole('button', { name: /upload/i }));
      expect(mockHandleGeneralAction).toHaveBeenCalledWith('confirm-upload');
    });

    it('disables confirm button when filename is invalid', () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: 'invalid',
        fileNameError: 'Invalid filename',
      });

      renderModal();
      expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
    });

    it('handles form submission', () => {
      renderModal();
      const form = screen.getByTestId('modal-body').querySelector('form');

      if (form) {
        fireEvent.submit(form);
        expect(mockHandleGeneralAction).toHaveBeenCalledWith('confirm-upload');
      }
    });

    it('prevents form submission when filename is invalid', () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: 'invalid',
        fileNameError: 'Error',
      });

      renderModal();
      const invalidForm = screen
        .getByTestId('modal-body')
        .querySelector('form');

      if (invalidForm) {
        fireEvent.submit(invalidForm);
        expect(mockHandleGeneralAction).not.toHaveBeenCalledWith(
          'confirm-upload',
        );
      }
    });
  });
});
