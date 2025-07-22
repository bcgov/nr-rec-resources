import { BaseFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock URL.createObjectURL
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "mocked-object-url"),
});

// Mock utility functions
vi.mock("@/utils/imageUtils", () => ({
  isImageFile: vi.fn(),
}));

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
}));

import { isImageFile } from "@/utils/imageUtils";

const mockIsImageFile = vi.mocked(isImageFile);

describe("BaseFileModal", () => {
  const defaultProps = {
    show: true,
    onHide: vi.fn(),
    title: "Test Modal",
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    confirmButtonText: "Confirm",
    confirmButtonIcon: faUpload,
  };

  const createFile = (name = "test.pdf", type = "application/pdf") =>
    new File(["test content"], name, { type });

  const createImageFile = (name = "test.jpg", type = "image/jpeg") =>
    new File(["test image content"], name, { type });

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsImageFile.mockImplementation((file) =>
      file.type.startsWith("image/"),
    );
  });

  describe("Modal Visibility", () => {
    it("renders when show is true", () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: reactQueryWrapper,
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("returns null when show is false", () => {
      const { container } = render(
        <BaseFileModal {...defaultProps} show={false} />,
        { wrapper: reactQueryWrapper },
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Modal Structure", () => {
    it("renders title correctly", () => {
      render(<BaseFileModal {...defaultProps} title="Custom Title" />, {
        wrapper: reactQueryWrapper,
      });

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("renders children when provided", () => {
      render(
        <BaseFileModal {...defaultProps}>
          <div data-testid="custom-content">Custom Content</div>
        </BaseFileModal>,
        { wrapper: reactQueryWrapper },
      );

      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    it("applies custom className correctly", () => {
      render(<BaseFileModal {...defaultProps} className="custom-modal" />, {
        wrapper: reactQueryWrapper,
      });

      const modal = screen.getByRole("dialog");
      expect(modal).toHaveClass("base-file-modal", "custom-modal");
    });
  });

  describe("File Preview", () => {
    it("shows image preview for image file", () => {
      const imageFile = createImageFile();
      render(<BaseFileModal {...defaultProps} file={imageFile} />, {
        wrapper: reactQueryWrapper,
      });

      const preview = screen.getByAltText("preview");
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute("src");
      expect(preview).toHaveClass("base-file-modal__preview-img");
    });

    it("shows image preview for image URL", () => {
      render(
        <BaseFileModal
          {...defaultProps}
          fileUrl="https://example.com/image.jpg"
        />,
        { wrapper: reactQueryWrapper },
      );

      const preview = screen.getByAltText("preview");
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    it("shows PDF icon for non-image file", () => {
      const pdfFile = createFile();
      render(<BaseFileModal {...defaultProps} file={pdfFile} />, {
        wrapper: reactQueryWrapper,
      });

      // Get PDF icon specifically (not the one in the confirm button)
      const pdfIcons = screen.getAllByTestId("font-awesome-icon");
      const pdfIcon = pdfIcons.find(
        (icon) => icon.getAttribute("data-icon") === "file-pdf",
      );
      expect(pdfIcon).toBeDefined();
      expect(pdfIcon).toHaveAttribute("data-size", "3x");
    });

    it("shows file name with PDF icon for non-image file", () => {
      const pdfFile = createFile("document.pdf");
      render(
        <BaseFileModal
          {...defaultProps}
          file={pdfFile}
          fileName="document.pdf"
        />,
        { wrapper: reactQueryWrapper },
      );

      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });

    it("detects image file types correctly from URL", () => {
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "heic",
        "webp",
        "gif",
        "bmp",
        "tiff",
      ];

      imageExtensions.forEach((ext) => {
        const { unmount } = render(
          <BaseFileModal {...defaultProps} fileUrl={`test.${ext}`} />,
          { wrapper: reactQueryWrapper },
        );

        expect(screen.getByAltText("preview")).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Alert Configuration", () => {
    it("renders alert when alertConfig is provided", () => {
      const alertConfig = {
        variant: "warning" as const,
        icon: faTrash,
        text: "Warning message",
        iconColor: "red",
      };

      render(<BaseFileModal {...defaultProps} alertConfig={alertConfig} />, {
        wrapper: reactQueryWrapper,
      });

      expect(screen.getByText("Warning message")).toBeInTheDocument();

      const alertIcon = screen
        .getAllByTestId("font-awesome-icon")
        .find((icon) => icon.getAttribute("data-icon") === "trash");
      expect(alertIcon).toBeInTheDocument();
      expect(alertIcon).toHaveAttribute("data-color", "red");
    });

    it("does not render alert when alertConfig is not provided", () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: reactQueryWrapper,
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("applies correct alert variant class", () => {
      const alertConfig = {
        variant: "danger" as const,
        icon: faTrash,
        text: "Danger message",
      };

      render(<BaseFileModal {...defaultProps} alertConfig={alertConfig} />, {
        wrapper: reactQueryWrapper,
      });

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("alert-danger");
    });
  });

  describe("Action Buttons", () => {
    it("renders Cancel button", () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: reactQueryWrapper,
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveAttribute("data-variant", "tertiary");
    });

    it("renders Confirm button with custom text and icon", () => {
      render(
        <BaseFileModal
          {...defaultProps}
          confirmButtonText="Delete"
          confirmButtonIcon={faTrash}
          confirmButtonVariant="danger"
        />,
        { wrapper: reactQueryWrapper },
      );

      const confirmButton = screen.getByRole("button", { name: /delete/i });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveAttribute("data-variant", "danger");
    });

    it("calls onCancel when Cancel button is clicked", () => {
      const mockOnCancel = vi.fn();
      render(<BaseFileModal {...defaultProps} onCancel={mockOnCancel} />, {
        wrapper: reactQueryWrapper,
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when Confirm button is clicked", () => {
      const mockOnConfirm = vi.fn();
      render(<BaseFileModal {...defaultProps} onConfirm={mockOnConfirm} />, {
        wrapper: reactQueryWrapper,
      });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("Modal Behavior", () => {
    it("calls onHide when close button is clicked", () => {
      const mockOnHide = vi.fn();
      render(<BaseFileModal {...defaultProps} onHide={mockOnHide} />, {
        wrapper: reactQueryWrapper,
      });

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    it("has correct modal size and centering", () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: reactQueryWrapper,
      });

      const modalDialog = screen
        .getByRole("dialog")
        .querySelector(".modal-dialog");
      expect(modalDialog).toHaveClass("modal-lg");
      expect(modalDialog).toHaveClass("modal-dialog-centered");
    });
  });

  describe("CSS Classes", () => {
    it("applies correct CSS classes with custom className", () => {
      render(<BaseFileModal {...defaultProps} className="upload-modal" />, {
        wrapper: reactQueryWrapper,
      });

      const title = screen.getByText("Test Modal");
      expect(title).toHaveClass(
        "upload-modal__title",
        "base-file-modal__title",
      );
    });

    it("applies default classes when no custom className provided", () => {
      render(<BaseFileModal {...defaultProps} />, {
        wrapper: reactQueryWrapper,
      });

      const title = screen.getByText("Test Modal");
      expect(title).toHaveClass("__title", "base-file-modal__title");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined file gracefully", () => {
      render(<BaseFileModal {...defaultProps} file={undefined} />, {
        wrapper: reactQueryWrapper,
      });

      // Should show PDF icon as fallback (not the one in the confirm button)
      const pdfIcons = screen.getAllByTestId("font-awesome-icon");
      const pdfIcon = pdfIcons.find(
        (icon) => icon.getAttribute("data-icon") === "file-pdf",
      );
      expect(pdfIcon).toBeDefined();
    });

    it("handles empty fileName gracefully", () => {
      render(<BaseFileModal {...defaultProps} fileName="" />, {
        wrapper: reactQueryWrapper,
      });

      // Should not render a file name element for empty string
      const previewSection = screen
        .getByRole("dialog")
        .querySelector(".base-file-modal__preview-pdf");
      const fileNameElement = previewSection?.querySelector(
        ".base-file-modal__file-name",
      );
      expect(fileNameElement).toBeNull();
    });

    it("handles missing optional props gracefully", () => {
      const minimalProps = {
        show: true,
        onHide: vi.fn(),
        title: "Minimal Modal",
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
