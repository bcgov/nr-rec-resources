import { BaseFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal";
import { GalleryFile } from "@/pages/rec-resource-page/types";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock URL.createObjectURL
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "mocked-object-url"),
});

// Mock FontAwesome icons
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon, size, color, className }: any) => (
    <div
      data-testid="font-awesome-icon"
      data-icon={icon.iconName || "mocked-icon"}
      data-size={size}
      data-color={color}
      className={className}
    />
  ),
}));

// Mock CustomButton
vi.mock("@/components", () => ({
  CustomButton: ({ children, onClick, variant, leftIcon }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {leftIcon}
      {children}
    </button>
  ),
  ClampLines: ({ text }: any) => <div>{text}</div>,
}));

describe("BaseFileModal", () => {
  const mockHandlers = {
    onHide: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  const documentFile: GalleryFile = {
    id: "doc-1",
    name: "test.pdf",
    date: "2023-01-01",
    url: "https://example.com/test.pdf",
    extension: "pdf",
    type: "document",
  };

  const imageFile: GalleryFile = {
    id: "img-1",
    name: "test.jpg",
    date: "2023-01-01",
    url: "https://example.com/test.jpg",
    extension: "jpg",
    type: "image",
  };

  const defaultProps = {
    show: true,
    title: "Test Modal",
    galleryFile: documentFile,
    confirmButtonText: "Confirm",
    confirmButtonIcon: faUpload,
    ...mockHandlers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering and Visibility", () => {
    it("shows/hides modal and renders content correctly", () => {
      const { rerender } = render(
        <BaseFileModal {...defaultProps} title="Custom" className="custom">
          <div data-testid="content">Content</div>
        </BaseFileModal>,
        { wrapper: reactQueryWrapper },
      );

      // Modal visibility and content
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Custom")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveClass(
        "base-file-modal",
        "custom",
      );

      // Hide modal
      rerender(<BaseFileModal {...defaultProps} show={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("File Previews", () => {
    it("renders correct preview based on file type", () => {
      // Test image preview
      render(<BaseFileModal {...defaultProps} galleryFile={imageFile} />, {
        wrapper: reactQueryWrapper,
      });

      const preview = screen.getByAltText("preview");
      expect(preview).toHaveAttribute("src", imageFile.url);
      expect(preview).toHaveClass("base-file-modal__preview-img");

      // Test document preview
      render(
        <BaseFileModal
          {...defaultProps}
          galleryFile={{ ...documentFile, name: "doc.pdf" }}
        />,
        { wrapper: reactQueryWrapper },
      );

      const pdfIcon = screen
        .getAllByTestId("font-awesome-icon")
        .find((icon) => icon.getAttribute("data-icon") === "file-pdf");

      expect(pdfIcon).toHaveAttribute("data-size", "3x");
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    });
  });

  describe("Alerts and Interactions", () => {
    it("handles alerts and button interactions", () => {
      const alertConfig = {
        variant: "warning" as const,
        icon: faTrash,
        text: "Warning message",
        iconColor: "red",
      };

      render(
        <BaseFileModal
          {...defaultProps}
          alertConfig={alertConfig}
          confirmButtonText="Delete"
          confirmButtonIcon={faTrash}
          confirmButtonVariant="danger"
        />,
        { wrapper: reactQueryWrapper },
      );

      // Alert rendering
      expect(screen.getByText("Warning message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("alert-warning");
      const alertIcon = screen
        .getAllByTestId("font-awesome-icon")
        .find((icon) => icon.getAttribute("data-icon") === "trash");
      expect(alertIcon).toHaveAttribute("data-color", "red");

      // Button interactions
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const confirmButton = screen.getByRole("button", { name: /delete/i });
      const closeButton = screen.getByRole("button", { name: /close/i });

      expect(cancelButton).toHaveAttribute("data-variant", "tertiary");
      expect(confirmButton).toHaveAttribute("data-variant", "danger");

      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);
      fireEvent.click(closeButton);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onHide).toHaveBeenCalledTimes(1);
    });

    it("works without alert config", () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: reactQueryWrapper,
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Styling and Edge Cases", () => {
    it("applies CSS classes and handles edge cases", () => {
      // Test CSS classes
      const { rerender } = render(
        <BaseFileModal {...defaultProps} className="custom" />,
        { wrapper: reactQueryWrapper },
      );

      const title = screen.getByText("Test Modal");
      expect(title).toHaveClass("custom__title", "base-file-modal__title");

      // Test modal styling
      const modalDialog = screen
        .getByRole("dialog")
        .querySelector(".modal-dialog");
      expect(modalDialog).toHaveClass("modal-lg", "modal-dialog-centered");

      // Test edge cases: empty filename and minimal props
      const emptyNameFile = { ...documentFile, name: "" };
      rerender(<BaseFileModal {...defaultProps} galleryFile={emptyNameFile} />);

      const pdfIcon = screen
        .getAllByTestId("font-awesome-icon")
        .find((icon) => icon.getAttribute("data-icon") === "file-pdf");
      expect(pdfIcon).toBeDefined();

      // Test minimal props don't throw
      const minimalProps = {
        show: true,
        onHide: vi.fn(),
        title: "Minimal",
        galleryFile: documentFile,
        confirmButtonText: "OK",
        confirmButtonIcon: faUpload,
      };

      expect(() =>
        render(<BaseFileModal {...minimalProps} />, {
          wrapper: reactQueryWrapper,
        }),
      ).not.toThrow();
    });
  });
});
