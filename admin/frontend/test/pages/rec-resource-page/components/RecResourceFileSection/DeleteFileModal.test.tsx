import { DeleteFileModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal";
import { GalleryFile } from "@/pages/rec-resource-page/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockFile: GalleryFile = {
  id: "test-file-1",
  name: "test-document.pdf",
  date: "2023-01-01",
  url: "http://example.com/test-document.pdf",
  extension: "pdf",
};

const mockOnAction = vi.fn();

describe("DeleteFileModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal when open is true", () => {
    render(
      <DeleteFileModal open={true} file={mockFile} onAction={mockOnAction} />,
    );

    expect(screen.getByText("Delete File")).toBeInTheDocument();
    expect(
      screen.getByText(/Deleting this image will remove it/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete file:/),
    ).toBeInTheDocument();
    expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
  });

  it("does not render modal when open is false", () => {
    render(
      <DeleteFileModal open={false} file={mockFile} onAction={mockOnAction} />,
    );

    expect(screen.queryByText("Delete File")).not.toBeInTheDocument();
  });

  it("calls onAction with cancel-delete when Cancel button is clicked", () => {
    render(
      <DeleteFileModal open={true} file={mockFile} onAction={mockOnAction} />,
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnAction).toHaveBeenCalledWith("cancel-delete", mockFile);
  });

  it("calls onAction with confirm-delete when Delete button is clicked", () => {
    render(
      <DeleteFileModal open={true} file={mockFile} onAction={mockOnAction} />,
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockOnAction).toHaveBeenCalledWith("confirm-delete", mockFile);
  });

  it("calls onAction with cancel-delete when modal is closed via close button", () => {
    render(
      <DeleteFileModal open={true} file={mockFile} onAction={mockOnAction} />,
    );

    // Find and click the close button (X button in modal header)
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnAction).toHaveBeenCalledWith("cancel-delete", mockFile);
  });

  it("displays correct file name in confirmation message", () => {
    const fileWithLongName: GalleryFile = {
      ...mockFile,
      name: "very-long-document-name-with-special-characters.pdf",
    };

    render(
      <DeleteFileModal
        open={true}
        file={fileWithLongName}
        onAction={mockOnAction}
      />,
    );

    expect(
      screen.getByText("very-long-document-name-with-special-characters.pdf"),
    ).toBeInTheDocument();
  });

  it("renders warning icon and alert message", () => {
    render(
      <DeleteFileModal open={true} file={mockFile} onAction={mockOnAction} />,
    );

    // Check that the alert is rendered
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Check that the warning text is present
    expect(
      screen.getByText(
        /Deleting this image will remove it from the public site/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/),
    ).toBeInTheDocument();
  });

  it("renders delete button with trash icon", () => {
    render(
      <DeleteFileModal open={true} file={mockFile} onAction={mockOnAction} />,
    );

    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toBeInTheDocument();

    // Check that the button has the danger variant styling
    expect(deleteButton.closest("button")).toHaveClass("btn-danger");
  });
});
