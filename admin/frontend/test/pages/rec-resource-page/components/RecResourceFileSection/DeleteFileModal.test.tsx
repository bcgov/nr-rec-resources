import { DeleteFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal';
import * as fileTransferState from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { reactQueryWrapper } from '@test/test-utils/reactQueryWrapper';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      alertConfig,
    }: any) =>
      show ? (
        <div data-testid="base-file-modal">
          <div data-testid="modal-title">{title}</div>
          {alertConfig && (
            <div role="alert" data-testid="alert">
              {alertConfig.text}
            </div>
          )}
          <div data-testid="modal-body">{children}</div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger">
            {confirmButtonText}
          </button>
          <button aria-label="Close" onClick={onCancel}></button>
        </div>
      ) : null,
  }),
);

// Mock the hook
vi.mock(
  '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState',
  () => ({
    useRecResourceFileTransferState: vi.fn(),
  }),
);

const mockFile: GalleryFile = {
  id: 'test-file-1',
  name: 'test-document.pdf',
  date: '2023-01-01',
  url: 'http://example.com/test-document.pdf',
  extension: 'pdf',
  type: 'document',
};

const mockImageFile: GalleryFile = {
  id: 'test-image-1',
  name: 'test-image.jpg',
  date: '2023-01-01',
  url: 'http://example.com/test-image.jpg',
  extension: 'jpg',
  type: 'image',
};

const mockHandleGeneralAction = vi.fn();
const mockUseRecResourceFileTransferState = vi.mocked(
  fileTransferState.useRecResourceFileTransferState,
);

describe('DeleteFileModal', () => {
  const renderModal = () =>
    render(<DeleteFileModal />, { wrapper: reactQueryWrapper });

  const setMockState = (state: {
    showDeleteModal?: boolean;
    fileToDelete?: GalleryFile | null;
  }) => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      deleteModalState: {
        showDeleteModal: state.showDeleteModal ?? false,
        fileToDelete: state.fileToDelete ?? null,
      },
      getDocumentGeneralActionHandler: vi.fn(
        (action) => () => mockHandleGeneralAction('document', action),
      ),
      getImageGeneralActionHandler: vi.fn(
        (action) => () => mockHandleGeneralAction('image', action),
      ),
    } as any);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setMockState({}); // Default empty state
  });

  describe('Modal Visibility', () => {
    it('renders modal when showDeleteModal is true and fileToDelete exists', () => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockFile,
      });

      renderModal();

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Delete File',
      );
      expect(
        screen.getByText(/Deleting this file will remove it/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete file?/),
      ).toBeInTheDocument();
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });

    it('renders modal when showDeleteModal is true and fileToDelete exists', () => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockImageFile,
      });

      renderModal();

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Delete File',
      );
      expect(
        screen.getByText(/Deleting this file will remove it/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete file?/),
      ).toBeInTheDocument();
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });

    it('returns null when showDeleteModal is false', () => {
      setMockState({
        showDeleteModal: false,
        fileToDelete: mockFile,
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();
    });

    it('returns null when fileToDelete is null', () => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: null,
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('User Interactions - Documents', () => {
    beforeEach(() => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockFile,
      });
    });

    it('calls cancel handler when Cancel button is clicked', () => {
      renderModal();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith(
        'document',
        'cancel-delete',
      );
    });

    it('calls confirm handler when Delete button is clicked', () => {
      renderModal();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith(
        'document',
        'confirm-delete',
      );
    });

    it('calls cancel handler when modal is closed via close button', () => {
      renderModal();

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith(
        'document',
        'cancel-delete',
      );
    });
  });

  describe('User Interactions - Images', () => {
    beforeEach(() => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockImageFile,
      });
    });

    it('calls cancel handler when Cancel button is clicked', () => {
      renderModal();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith(
        'image',
        'cancel-delete',
      );
    });

    it('calls confirm handler when Delete button is clicked', () => {
      renderModal();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith(
        'image',
        'confirm-delete',
      );
    });

    it('calls cancel handler when modal is closed via close button', () => {
      renderModal();

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith(
        'image',
        'cancel-delete',
      );
    });
  });

  describe('Content Display', () => {
    it('displays correct file name in confirmation message', () => {
      const fileWithLongName: GalleryFile = {
        ...mockFile,
        name: 'very-long-document-name-with-special-characters.pdf',
      };

      setMockState({
        showDeleteModal: true,
        fileToDelete: fileWithLongName,
      });

      renderModal();

      expect(
        screen.getByText('very-long-document-name-with-special-characters.pdf'),
      ).toBeInTheDocument();
    });

    it('renders warning alert message', () => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockFile,
      });

      renderModal();

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Deleting this file will remove it from the public site/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/This action cannot be undone/),
      ).toBeInTheDocument();
    });

    it('renders delete button with correct styling', () => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockFile,
      });

      renderModal();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('btn-danger');
    });
  });
});
