import { render, screen, fireEvent } from "@testing-library/react";
import { GalleryFileCard } from "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard";

describe("GalleryFileCard", () => {
  const renderCard = (file: any, onAction = () => {}, props = {}) =>
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

  it("renders pending state", () => {
    renderCard({ name: "Pending.pdf", isUploading: true });
    expect(screen.getByText(/Uploading/)).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
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
});
