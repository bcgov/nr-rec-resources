import { DeleteFileModal } from '@/components/delete-confirmation-modal/DeleteFileModal';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hideDeleteModal } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

// Mock BaseFileModal with correct path
vi.mock('@/components/file/BaseFileModal', () => ({
  BaseFileModal: ({
    show,
    title,
    children,
    onCancel,
    onConfirm,
    confirmButtonText,
    alerts,
  }: any) =>
    show ? (
      <div data-testid="base-file-modal">
        <div data-testid="modal-title">{title}</div>
        {alerts?.map((alert: any, index: number) => (
          <div key={index} role="alert" data-testid="alert">
            {alert.text}
          </div>
        ))}
        <div data-testid="modal-body">{children}</div>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm} className="btn-danger">
          {confirmButtonText}
        </button>
        <button aria-label="Close" onClick={onCancel}></button>
      </div>
    ) : null,
}));

// Mock store
vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  hideDeleteModal: vi.fn(),
  recResourceFileTransferStore: {},
}));

// Track store state for useStore mock - use object so values can be mutated
const mockStore = {
  showDeleteModal: false,
  fileToDelete: undefined as GalleryFile | undefined,
};

vi.mock('@tanstack/react-store', () => ({
  useStore: vi.fn(() => mockStore),
}));

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

describe('DeleteFileModal', () => {
  const renderModal = (props?: any) =>
    render(<DeleteFileModal {...props} />, {
      wrapper: TestQueryClientProvider,
    });

  const setMockState = (state: {
    showDeleteModal?: boolean;
    fileToDelete?: GalleryFile | null;
  }) => {
    mockStore.showDeleteModal = state.showDeleteModal ?? false;
    mockStore.fileToDelete = state.fileToDelete ?? undefined;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.showDeleteModal = false;
    mockStore.fileToDelete = undefined;
  });

  describe('Store Mode - Modal Visibility', () => {
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
        screen.getByText(/Are you sure you want to delete this file\?/),
      ).toBeInTheDocument();
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
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

  describe('Store Mode - User Interactions', () => {
    beforeEach(() => {
      setMockState({
        showDeleteModal: true,
        fileToDelete: mockFile,
      });
    });

    it('calls hideDeleteModal when Cancel button is clicked', () => {
      renderModal();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(hideDeleteModal).toHaveBeenCalled();
    });

    it('calls hideDeleteModal when modal is closed via close button', () => {
      renderModal();

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(hideDeleteModal).toHaveBeenCalled();
    });
  });

  describe('Store Mode - Content Display', () => {
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

  describe('Props Mode - Modal with custom props', () => {
    const mockOnCancel = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
      mockOnCancel.mockClear();
      mockOnConfirm.mockClear();
    });

    it('renders modal with props when show prop is provided', () => {
      renderModal({
        show: true,
        file: mockFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
        title: 'Delete establishment order',
        alertText: 'Custom alert text',
        confirmationText: 'Custom confirmation text',
      });

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Delete establishment order',
      );
      expect(screen.getByText('Custom alert text')).toBeInTheDocument();
      expect(screen.getByText('Custom confirmation text')).toBeInTheDocument();
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });

    it('returns null when show is false in props mode', () => {
      const { container } = renderModal({
        show: false,
        file: mockFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      expect(container.firstChild).toBeNull();
    });

    it('returns null when file is null in props mode', () => {
      const { container } = renderModal({
        show: true,
        file: null,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      expect(container.firstChild).toBeNull();
    });

    it('calls provided onCancel callback in props mode', () => {
      renderModal({
        show: true,
        file: mockFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls provided onConfirm callback in props mode', () => {
      renderModal({
        show: true,
        file: mockFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('calls provided onCancel callback when close button is clicked in props mode', () => {
      renderModal({
        show: true,
        file: mockFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('uses default title and messages when not provided in props mode', () => {
      renderModal({
        show: true,
        file: mockFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
      });

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Delete File',
      );
      expect(
        screen.getByText(
          /Deleting this file will remove it from the public site/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete this file\?/),
      ).toBeInTheDocument();
    });

    it('works with image files in props mode', () => {
      renderModal({
        show: true,
        file: mockImageFile,
        onCancel: mockOnCancel,
        onConfirm: mockOnConfirm,
        title: 'Delete image',
      });

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Delete image',
      );
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });
  });
});
