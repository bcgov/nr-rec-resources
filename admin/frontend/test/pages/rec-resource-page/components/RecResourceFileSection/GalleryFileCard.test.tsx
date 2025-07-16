import { GalleryFileCard } from "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

describe("GalleryFileCard", () => {
  const renderCard = (file: any, onAction = vi.fn(), props = {}) =>
    render(<GalleryFileCard file={file} onAction={onAction} {...props} />);

  it.each([
    [{ name: "Test.pdf", date: "2025-07-10" }, /Test.pdf/, /2025-07-10/],
    [{ name: "Test.pdf" }, /Test.pdf/, null],
    [{}, /Untitled/, /-/],
  ])("renders file name/date edge cases", (file, name, date) => {
    renderCard(file);
    expect(screen.getByText(name)).toBeInTheDocument();
    if (date) expect(screen.getByText(date)).toBeInTheDocument();
  });

  it("calls onAction when 'View' action button is clicked", () => {
    const onAction = vi.fn();
    renderCard({ name: "Test.pdf" }, onAction);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(onAction).toHaveBeenCalledWith(
      "view",
      expect.objectContaining({ name: "Test.pdf" }),
    );
  });

  it("calls onAction when 'Download' action button is clicked", () => {
    const onAction = vi.fn();
    renderCard({ name: "Test.pdf" }, onAction);
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onAction).toHaveBeenCalledWith(
      "download",
      expect.objectContaining({ name: "Test.pdf" }),
    );
  });

  it("calls onAction when 'Delete' action button is clicked", () => {
    const onAction = vi.fn();
    renderCard({ name: "Test.pdf" }, onAction);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onAction).toHaveBeenCalledWith(
      "delete",
      expect.objectContaining({ name: "Test.pdf" }),
    );
  });

  it("renders error state and handles retry action", () => {
    const onAction = vi.fn();
    renderCard({ name: "Error.pdf", uploadFailed: true }, onAction);
    expect(screen.getByText(/Upload Failed/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
    expect(onAction).toHaveBeenCalledWith(
      "retry",
      expect.objectContaining({ name: "Error.pdf" }),
    );
    const filenameDiv = screen
      .getByText("Error.pdf")
      .closest(".gallery-file-card__filename");
    expect(filenameDiv?.className).toMatch(/filename--error/);
  });

  it("renders uploading state", () => {
    renderCard({ name: "TestFile.pdf", isUploading: true });
    expect(screen.getByText("Uploading")).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
  });

  it("renders downloading state", () => {
    renderCard({ name: "TestFile.pdf", isDownloading: true });
    expect(screen.getByText("Downloading")).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
  });

  it("disables dropdown menu when file is uploading", () => {
    renderCard({ name: "Uploading.pdf", isUploading: true });
    const menuButton = screen.getByLabelText("File actions menu");
    expect(menuButton).toBeDisabled();
  });

  it("renders top content when provided", () => {
    const topContent = <div data-testid="top-content">Custom Top Content</div>;
    renderCard({ name: "Test.pdf" }, vi.fn(), { topContent });
    expect(screen.getByTestId("top-content")).toBeInTheDocument();
    expect(screen.getByText("Custom Top Content")).toBeInTheDocument();
  });

  it("applies error styling to card when upload failed", () => {
    renderCard({ name: "Error.pdf", uploadFailed: true });
    const card = document.querySelector(".gallery-file-card");
    expect(card).toHaveClass("gallery-file-card--error");
  });

  it("applies error styling to filename when upload failed", () => {
    renderCard({ name: "Error.pdf", uploadFailed: true });
    const filename = screen
      .getByText("Error.pdf")
      .closest(".gallery-file-card__filename");
    expect(filename).toHaveClass("gallery-file-card__filename--error");
  });

  it("applies error styling to date when upload failed", () => {
    renderCard({ name: "Error.pdf", date: "2025-07-10", uploadFailed: true });
    const dateElement = screen.getByText("2025-07-10");
    expect(dateElement).toHaveClass("gallery-file-card__date--error");
  });

  it("applies muted styling to date when no upload error", () => {
    renderCard({ name: "Normal.pdf", date: "2025-07-10" });
    const dateElement = screen.getByText("2025-07-10");
    expect(dateElement).toHaveClass("text-muted");
  });

  it("calls onAction for all dropdown actions", async () => {
    const onAction = vi.fn();
    renderCard({ name: "Dropdown.pdf", date: "2025-07-10" }, onAction);
    const menuButton = screen.getByLabelText("File actions menu");
    await import("react").then(({ act }) =>
      act(() => fireEvent.click(menuButton)),
    );
    ["View", "Download", "Delete"].forEach((label) => {
      const items = screen.getAllByText(label);
      const dropdownItem = items.find((el) => el.closest(".dropdown-menu"));
      fireEvent.click(dropdownItem!);
      expect(onAction).toHaveBeenCalledWith(
        label.toLowerCase(),
        expect.objectContaining({ name: "Dropdown.pdf" }),
      );
    });
  });

  it("shows retry in dropdown if upload failed", async () => {
    const onAction = vi.fn();
    renderCard({ name: "Retry.pdf", uploadFailed: true }, onAction);
    const menuButton = screen.getByLabelText("File actions menu");
    await import("react").then(({ act }) =>
      act(() => fireEvent.click(menuButton)),
    );
    const retryItems = screen.getAllByText("Retry");
    const dropdownRetry = retryItems.find((el) => el.closest(".dropdown-menu"));
    fireEvent.click(dropdownRetry!);
    expect(onAction).toHaveBeenCalledWith(
      "retry",
      expect.objectContaining({ name: "Retry.pdf" }),
    );
  });

  it("renders normal state with action buttons when no special states", () => {
    renderCard({ name: "Normal.pdf" });
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("handles files with very long names using clamp lines", () => {
    const longName =
      "This is a very long file name that should be clamped to prevent overflow in the UI component and maintain proper layout.pdf";
    renderCard({ name: longName });
    expect(screen.getByText(longName)).toBeInTheDocument();
    const clampedElement = document.querySelector(
      ".gallery-file-card__filename-ellipsis",
    );
    expect(clampedElement).toBeInTheDocument();
  });

  it("handles action clicks via Stack containers", () => {
    const onAction = vi.fn();
    renderCard({ name: "Test.pdf" }, onAction);

    // Find action button containers and click them
    const actionContainers = document.querySelectorAll(
      ".gallery-file-card__action-button-container",
    );
    expect(actionContainers).toHaveLength(3); // view, download, delete

    // Click the first action container (view)
    fireEvent.click(actionContainers[0]);
    expect(onAction).toHaveBeenCalledWith(
      "view",
      expect.objectContaining({ name: "Test.pdf" }),
    );
  });
});
