import { GalleryFileCard } from "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard";
import type { GalleryFile } from "@/pages/rec-resource-page/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Mock dependencies
vi.mock("@/components/clamp-lines", () => ({
  ClampLines: ({ text, className }: { text: string; className: string }) => (
    <span className={className}>{text}</span>
  ),
}));

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(({ icon, ...props }: any) => (
    <svg {...props} data-icon={icon.iconName} />
  )),
}));

// Mock internal components
vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/ActionButton",
  () => ({
    ActionButton: ({ label, onClick }: any) => (
      <div
        className="gallery-file-card__action-button-container"
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e: any) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <span>{label}</span>
      </div>
    ),
  }),
);

vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/DropdownActionItem",
  () => ({
    DropdownActionItem: ({ label, onClick }: any) => (
      <div className="dropdown-item" onClick={onClick}>
        {label}
      </div>
    ),
  }),
);

vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/LoadingState",
  () => ({
    LoadingState: ({ label }: { label: string }) => (
      <div>
        <div
          role="status"
          aria-label={`${label} in progress`}
          className="spinner-border"
        />
        <span>{label}</span>
      </div>
    ),
  }),
);

describe("GalleryFileCard", () => {
  const mockFile: GalleryFile = {
    id: "1",
    name: "test.pdf",
    date: "2025-01-01",
    url: "http://example.com/test.pdf",
    extension: "pdf",
    type: "document",
  };

  const renderCard = (
    file: Partial<GalleryFile> = {},
    getFileActionHandler = vi.fn(() => vi.fn()),
    props = {},
  ) =>
    render(
      <GalleryFileCard
        file={{ ...mockFile, ...file }}
        getFileActionHandler={getFileActionHandler}
        {...props}
      />,
    );

  describe("File Display", () => {
    it("renders file name and date", () => {
      renderCard({ name: "document.pdf", date: "2025-01-01" });

      expect(screen.getByText("document.pdf")).toBeInTheDocument();
      expect(screen.getByText("2025-01-01")).toBeInTheDocument();
    });

    it("shows fallback text for missing properties", () => {
      renderCard({ name: "", date: "" });

      expect(screen.getByText("Untitled")).toBeInTheDocument();
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders custom top content", () => {
      const topContent = <div data-testid="custom-content">Custom</div>;
      renderCard({}, vi.fn(), { topContent });

      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    });
  });

  describe("Action Handling", () => {
    it.each([
      ["View", "view"],
      ["Download", "download"],
      ["Delete", "delete"],
    ])("handles %s action via button", (label, action) => {
      const mockHandler = vi.fn();
      const getFileActionHandler = vi.fn(() => mockHandler);
      renderCard({}, getFileActionHandler);

      fireEvent.click(screen.getByLabelText(label));
      expect(getFileActionHandler).toHaveBeenCalledWith(
        action,
        expect.any(Object),
      );
      expect(mockHandler).toHaveBeenCalled();
    });

    it("handles actions via dropdown menu", () => {
      const mockHandler = vi.fn();
      const getFileActionHandler = vi.fn(() => mockHandler);
      renderCard({}, getFileActionHandler);

      const menuButton = screen.getByLabelText("File actions menu");
      fireEvent.click(menuButton);

      const dropdownItems = screen.getAllByText("View");
      const dropdownView = dropdownItems.find((el) =>
        el.closest(".dropdown-item"),
      );
      fireEvent.click(dropdownView!);

      expect(getFileActionHandler).toHaveBeenCalledWith(
        "view",
        expect.any(Object),
      );
      expect(mockHandler).toHaveBeenCalled();
    });

    it("handles keyboard navigation on action buttons", async () => {
      const user = userEvent.setup();
      const mockHandler = vi.fn();
      const getFileActionHandler = vi.fn(() => mockHandler);
      renderCard({}, getFileActionHandler);

      const actionButton = screen.getByLabelText("View");
      actionButton.focus();
      await user.keyboard("{Enter}");

      expect(getFileActionHandler).toHaveBeenCalledWith(
        "view",
        expect.any(Object),
      );
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("Error State", () => {
    it("displays error state with retry and dismiss options", () => {
      const mockHandler = vi.fn();
      const getFileActionHandler = vi.fn(() => mockHandler);
      renderCard({ uploadFailed: true }, getFileActionHandler);

      expect(screen.getByText("Upload Failed")).toBeInTheDocument();

      // Test retry button
      fireEvent.click(screen.getByLabelText("Retry"));
      expect(getFileActionHandler).toHaveBeenCalledWith(
        "retry",
        expect.any(Object),
      );

      // Test dismiss button
      fireEvent.click(screen.getByLabelText("Dismiss"));
      expect(getFileActionHandler).toHaveBeenCalledWith(
        "dismiss",
        expect.any(Object),
      );

      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it("displays faFileImage icon for image file upload error", () => {
      renderCard({ uploadFailed: true, type: "image" });
      const FontAwesomeIconCalls = (FontAwesomeIcon as any).mock.calls;
      const found = FontAwesomeIconCalls.some(
        ([props]: any[]) => props.icon && props.icon.iconName === "file-image", // icon name for faFileImage
      );
      expect(found).toBe(true);
    });

    it("shows retry and dismiss in dropdown for failed uploads", () => {
      const mockHandler = vi.fn();
      const getFileActionHandler = vi.fn(() => mockHandler);
      renderCard({ uploadFailed: true }, getFileActionHandler);

      const menuButton = screen.getByLabelText("File actions menu");
      fireEvent.click(menuButton);

      // Test retry dropdown item
      const retryItem = screen
        .getAllByText("Retry")
        .find((el) => el.closest(".dropdown-item"));
      fireEvent.click(retryItem!);

      expect(getFileActionHandler).toHaveBeenCalledWith(
        "retry",
        expect.any(Object),
      );

      // Test dismiss dropdown item
      const dismissItem = screen
        .getAllByText("Dismiss")
        .find((el) => el.closest(".dropdown-item"));
      fireEvent.click(dismissItem!);

      expect(getFileActionHandler).toHaveBeenCalledWith(
        "dismiss",
        expect.any(Object),
      );

      expect(mockHandler).toHaveBeenCalledTimes(2);
    });
    it("applies error styling", () => {
      renderCard({ uploadFailed: true });

      expect(
        document.querySelector(".gallery-file-card--error"),
      ).toBeInTheDocument();
      expect(
        document.querySelector(".gallery-file-card__top--error"),
      ).toBeInTheDocument();
      expect(
        document.querySelector(".gallery-file-card__filename--error"),
      ).toBeInTheDocument();
      expect(
        document.querySelector(".gallery-file-card__date--error"),
      ).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("shows uploading state", () => {
      renderCard({ isUploading: true });

      expect(screen.getByText("Uploading")).toBeInTheDocument();
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("shows downloading state", () => {
      renderCard({ isDownloading: true });

      expect(screen.getByText("Downloading")).toBeInTheDocument();
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("shows deleting state", () => {
      renderCard({ isDeleting: true });

      expect(screen.getByText("Deleting")).toBeInTheDocument();
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("prioritizes uploading over downloading", () => {
      renderCard({ isUploading: true, isDownloading: true });

      expect(screen.getByText("Uploading")).toBeInTheDocument();
      expect(screen.queryByText("Downloading")).not.toBeInTheDocument();
    });

    it("prioritizes error over loading states", () => {
      renderCard({ uploadFailed: true, isUploading: true });

      expect(screen.getByText("Upload Failed")).toBeInTheDocument();
      expect(screen.queryByText("Uploading")).not.toBeInTheDocument();
    });

    it("disables dropdown during upload", () => {
      renderCard({ isUploading: true });

      const menuButton = screen.getByLabelText("File actions menu");
      expect(menuButton).toBeDisabled();
    });

    it("applies pending styling", () => {
      renderCard({ isUploading: true });

      expect(
        document.querySelector(".gallery-file-card__top--pending"),
      ).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("applies normal state classes", () => {
      renderCard({});

      expect(document.querySelector(".gallery-file-card")).toBeInTheDocument();
      expect(
        document.querySelector(".gallery-file-card__top"),
      ).toBeInTheDocument();
      expect(
        document.querySelector(".gallery-file-card__filename"),
      ).toBeInTheDocument();
      expect(document.querySelector(".text-muted")).toBeInTheDocument();
    });

    it("toggles error classes correctly", () => {
      const { rerender } = renderCard({ uploadFailed: false });
      expect(
        document.querySelector(".gallery-file-card--error"),
      ).not.toBeInTheDocument();

      rerender(
        <GalleryFileCard
          file={{ ...mockFile, uploadFailed: true }}
          getFileActionHandler={vi.fn(() => vi.fn())}
        />,
      );
      expect(
        document.querySelector(".gallery-file-card--error"),
      ).toBeInTheDocument();
    });
  });
});
