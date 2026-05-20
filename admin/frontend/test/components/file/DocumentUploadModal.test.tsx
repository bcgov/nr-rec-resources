import { DocumentUploadModal } from '@/components/file/DocumentUploadModal';
import * as fileTransferState from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/utils', () => ({
  getFileNameWithoutExtension: vi.fn((file) => file.name.split('.')[0]),
}));

vi.mock('@/utils/imageUtils', () => ({
  isImageFile: vi.fn((file) => file.type.startsWith('image/')),
}));

vi.mock('@/components/file/BaseFileModal', () => ({
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
}));

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

describe('DocumentUploadModal', () => {
  const createFile = (
    name = 'test.pdf',
    fileType = 'application/pdf',
    galleryType: 'image' | 'document' = 'document',
  ) => ({
    id: 'test-id',
    name,
    date: '2023-01-01',
    url: '',
    extension: name.split('.').pop() || 'pdf',
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

  const renderModal = (props?: any) =>
    render(<DocumentUploadModal {...props} />, {
      wrapper: TestQueryClientProvider,
    });

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

    it('renders with correct title for documents and returns null for images', () => {
      // Images should return null - handled by ImageUploadModal
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile('test.jpg', 'image/jpeg', 'image'),
      });
      const { container: imageContainer } = renderModal();
      expect(imageContainer.firstChild).toBeNull();

      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(
          'test.pdf',
          'application/pdf',
          'document',
        ),
      });
      renderModal();
      expect(screen.getByText('Upload document')).toBeInTheDocument();
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

  describe('Props Mode - Store-based fallback', () => {
    it('returns null when not shown or no file selected in store mode', () => {
      setMockState({
        showUploadOverlay: false,
        selectedFileForUpload: createFile(),
      });
      expect(renderModal().container.firstChild).toBeNull();

      setMockState({ showUploadOverlay: true, selectedFileForUpload: null });
      expect(renderModal().container.firstChild).toBeNull();
    });
  });

  describe('Props Mode - Props-based with custom callbacks', () => {
    const mockOnFileNameChange = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
      mockOnFileNameChange.mockClear();
      mockOnCancel.mockClear();
      mockOnConfirm.mockClear();
      vi.clearAllMocks();
    });

    it('renders with props when show prop is provided', () => {
      const file = createFile();
      renderModal({
        show: true,
        file,
        fileName: 'test-file',
        onFileNameChange: mockOnFileNameChange,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
        title: 'Upload establishment order',
      });

      expect(
        screen.getByText('Upload establishment order'),
      ).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('test-file');
    });

    it('returns null when show is false in props mode', () => {
      const file = createFile();
      const { container } = renderModal({
        show: false,
        file,
        fileName: 'test-file',
      });

      expect(container.firstChild).toBeNull();
    });

    it('returns null when file is null in props mode', () => {
      const { container } = renderModal({
        show: true,
        file: null,
        fileName: 'test-file',
      });

      expect(container.firstChild).toBeNull();
    });

    it('handles file name changes with provided callback in props mode', () => {
      const file = createFile();
      renderModal({
        show: true,
        file,
        fileName: 'initial',
        onFileNameChange: mockOnFileNameChange,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new-name' } });

      expect(mockOnFileNameChange).toHaveBeenCalledWith('new-name');
    });

    it('calls provided onCancel callback in props mode', () => {
      const file = createFile();
      renderModal({
        show: true,
        file,
        fileName: 'test',
        onFileNameChange: mockOnFileNameChange,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls provided onConfirm callback in props mode', () => {
      const file = createFile();
      renderModal({
        show: true,
        file,
        fileName: 'test',
        onFileNameChange: mockOnFileNameChange,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      fireEvent.click(screen.getByRole('button', { name: /upload/i }));
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('uses custom title when provided in props mode', () => {
      const file = createFile();
      renderModal({
        show: true,
        file,
        fileName: 'test',
        title: 'Custom upload title',
        onFileNameChange: mockOnFileNameChange,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      expect(screen.getByText('Custom upload title')).toBeInTheDocument();
    });

    it('shows validation errors in props mode', () => {
      const file = createFile();
      renderModal({
        show: true,
        file,
        fileName: 'test',
        fileNameError: 'Invalid filename format',
        onFileNameChange: mockOnFileNameChange,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      expect(screen.getByText('Invalid filename format')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('is-invalid');
      expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
    });
  });
});
