import { DeleteFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal";
import * as fileTransferState from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { GalleryFile } from "@/pages/rec-resource-page/types";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock BaseFileModal
vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal",
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
  "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState",
  () => ({
    useRecResourceFileTransferState: vi.fn(),
  }),
);

const mockFile: GalleryFile = {
  id: "test-file-1",
  name: "test-document.pdf",
  date: "2023-01-01",
  url: "http://example.com/test-document.pdf",
  extension: "pdf",
};

const mockHandleGeneralAction = vi.fn();
const mockUseRecResourceFileTransferState = vi.mocked(
  fileTransferState.useRecResourceFileTransferState,
);

describe("DeleteFileModal", () => {
  const renderModal = () =>
    render(<DeleteFileModal />, { wrapper: reactQueryWrapper });

  const setMockState = (state: {
    showDeleteModal?: boolean;
    docToDelete?: GalleryFile | null;
  }) => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      deleteModalState: {
        showDeleteModal: state.showDeleteModal ?? false,
        docToDelete: state.docToDelete ?? null,
      },
      getDocumentGeneralActionHandler: vi.fn(
        (action) => () => mockHandleGeneralAction(action),
      ),
    } as any);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setMockState({}); // Default empty state
  });

  describe("Modal Visibility", () => {
    it("renders modal when showDeleteModal is true and docToDelete exists", () => {
      setMockState({
        showDeleteModal: true,
        docToDelete: mockFile,
      });

      renderModal();

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Delete File",
      );
      expect(
        screen.getByText(/Deleting this document will remove it/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete file:/),
      ).toBeInTheDocument();
      expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
    });

    it("returns null when showDeleteModal is false", () => {
      setMockState({
        showDeleteModal: false,
        docToDelete: mockFile,
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();
    });

    it("returns null when docToDelete is null", () => {
      setMockState({
        showDeleteModal: true,
        docToDelete: null,
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();
    });
  });

  describe("User Interactions", () => {
    beforeEach(() => {
      setMockState({
        showDeleteModal: true,
        docToDelete: mockFile,
      });
    });

    it("calls cancel handler when Cancel button is clicked", () => {
      renderModal();

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith("cancel-delete");
    });

    it("calls confirm handler when Delete button is clicked", () => {
      renderModal();

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith("confirm-delete");
    });

    it("calls cancel handler when modal is closed via close button", () => {
      renderModal();

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith("cancel-delete");
    });
  });

  describe("Content Display", () => {
    it("displays correct file name in confirmation message", () => {
      const fileWithLongName: GalleryFile = {
        ...mockFile,
        name: "very-long-document-name-with-special-characters.pdf",
      };

      setMockState({
        showDeleteModal: true,
        docToDelete: fileWithLongName,
      });

      renderModal();

      expect(
        screen.getByText("very-long-document-name-with-special-characters.pdf"),
      ).toBeInTheDocument();
    });

    it("renders warning alert message", () => {
      setMockState({
        showDeleteModal: true,
        docToDelete: mockFile,
      });

      renderModal();

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Deleting this document will remove it from the public site/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/This action cannot be undone/),
      ).toBeInTheDocument();
    });

    it("renders delete button with correct styling", () => {
      setMockState({
        showDeleteModal: true,
        docToDelete: mockFile,
      });

      renderModal();

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass("btn-danger");
    });
  });

  describe("Integration with Hook", () => {
    it("uses hook state correctly", () => {
      const customFile: GalleryFile = {
        id: "custom-file",
        name: "custom.jpg",
        date: "2023-12-01",
        url: "http://example.com/custom.jpg",
        extension: "jpg",
      };

      setMockState({
        showDeleteModal: true,
        docToDelete: customFile,
      });

      renderModal();

      expect(screen.getByText("custom.jpg")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete file:/),
      ).toBeInTheDocument();
    });
  });
});
