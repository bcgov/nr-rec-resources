import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";
import * as fileTransferState from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { setUploadFileName } from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock utility functions
vi.mock("@/utils/fileUtils", () => ({
  getFileNameWithoutExtension: vi.fn((file) => file.name.split(".")[0]),
}));

vi.mock("@/utils/imageUtils", () => ({
  isImageFile: vi.fn((file) => file.type.startsWith("image/")),
}));

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
    }: any) =>
      show ? (
        <div data-testid="base-file-modal">
          <div data-testid="modal-title">{title}</div>
          <div data-testid="modal-body">{children}</div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>{confirmButtonText}</button>
        </div>
      ) : null,
  }),
);

// Mock the main hook
vi.mock(
  "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState",
  () => ({
    useRecResourceFileTransferState: vi.fn(),
  }),
);

// Mock store action
vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  setUploadFileName: vi.fn(),
}));

const mockHandleGeneralAction = vi.fn();
const mockUseRecResourceFileTransferState = vi.mocked(
  fileTransferState.useRecResourceFileTransferState,
);
const mockSetUploadFileName = vi.mocked(setUploadFileName);

describe("FileUploadModal", () => {
  const createFile = (
    name = "test.png",
    fileType = "image/png",
    galleryType: "image" | "document" = "image",
  ) => ({
    id: "test-id",
    name: name,
    date: "2023-01-01",
    url: "",
    extension: name.split(".").pop() || "png",
    type: galleryType,
    pendingFile: new File(["test content"], name, { type: fileType }),
  });
  const renderModal = () =>
    render(<FileUploadModal />, { wrapper: reactQueryWrapper });

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
        uploadFileName: state.uploadFileName ?? "",
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

  beforeEach(() => {
    vi.clearAllMocks();
    setMockState({}); // Default empty state
  });

  describe("Modal Visibility", () => {
    it("returns null when showUploadOverlay is false", () => {
      setMockState({
        showUploadOverlay: false,
        selectedFileForUpload: createFile(),
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();
    });

    it("returns null when selectedFileForUpload is null", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: null,
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();
    });

    it("renders modal when both showUploadOverlay is true and file is selected", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile("test.jpg", "image/jpeg", "image"),
      });

      renderModal();
      expect(screen.getByText("Upload image")).toBeInTheDocument();
    });
  });

  describe("Modal Title", () => {
    it("displays 'Upload image' for image files", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile("test.jpg", "image/jpeg", "image"),
      });

      renderModal();
      expect(screen.getByText("Upload image")).toBeInTheDocument();
    });

    it("displays 'Upload file' for non-image files", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(
          "test.pdf",
          "application/pdf",
          "document",
        ),
      });

      renderModal();
      expect(screen.getByText("Upload file")).toBeInTheDocument();
    });
  });

  describe("File Name Input", () => {
    it("displays the current upload file name", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: "test",
      });

      renderModal();
      // The input should show the filename from the mock state
      expect(screen.getByDisplayValue("test")).toBeInTheDocument();
    });

    it("updates file name when input changes", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: "Original Name",
      });

      renderModal();
      const nameInput = screen.getByRole("textbox");

      fireEvent.change(nameInput, { target: { value: "New Name" } });

      // Verify store action was called
      expect(mockSetUploadFileName).toHaveBeenCalledWith("New Name");
    });

    it("has correct placeholder text", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: "",
      });

      renderModal();
      const nameInput = screen.getByPlaceholderText("Enter file name");
      expect(nameInput).toBeInTheDocument();
    });

    it("has maxLength of 100 characters", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
      });

      renderModal();
      const nameInput = screen.getByRole("textbox");
      expect(nameInput).toHaveAttribute("maxLength", "100");
    });

    it("displays error message when fileNameError is present", () => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: "duplicate-name",
        fileNameError:
          "A file with this name already exists. Please choose a different name",
      });

      renderModal();
      expect(
        screen.getByText(
          "A file with this name already exists. Please choose a different name",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    beforeEach(() => {
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
        uploadFileName: "Test File",
      });
    });

    it("calls cancel handler when Cancel button is clicked", () => {
      renderModal();
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      fireEvent.click(cancelButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith("cancel-upload");
    });

    it("calls confirm handler when Upload button is clicked", () => {
      renderModal();
      const uploadButton = screen.getByRole("button", { name: /upload/i });

      fireEvent.click(uploadButton);

      expect(mockHandleGeneralAction).toHaveBeenCalledWith("confirm-upload");
    });
  });

  describe("Integration with Store", () => {
    it("renders based on hook state", () => {
      setMockState({
        showUploadOverlay: false,
        selectedFileForUpload: createFile(),
      });

      const { container } = renderModal();
      expect(container.firstChild).toBeNull();

      // Update state and render again
      setMockState({
        showUploadOverlay: true,
        selectedFileForUpload: createFile(),
      });

      renderModal();
      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Upload image",
      );
    });
  });
});
