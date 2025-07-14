import { render, screen, fireEvent } from "@testing-library/react";
import { FileUploadModal } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal";

// Mock URL.createObjectURL for jsdom
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock");

describe("FileUploadModal", () => {
  const file = (name = "test.png", type = "image/png") =>
    new File([""], name, { type });
  const noop = () => {};
  const baseProps = {
    open: true,
    file: file(),
    fileName: "Test File",
    onFileNameChange: noop,
    onCancel: noop,
    onUploadConfirmation: noop,
  };
  const renderModal = (props = {}) =>
    render(<FileUploadModal {...baseProps} {...props} />);

  it.each([
    [{ open: true, file: file(), fileName: "Test File" }, true],
    [{ open: false, file: file(), fileName: "Test File" }, false],
    [{ open: true, file: null, fileName: "Test File" }, false],
  ])("renders modal open/closed/null file", (props, shouldRender) => {
    const { container } = renderModal(props);
    if (shouldRender) {
      expect(screen.getByText(/Upload image|Upload file/)).toBeInTheDocument();
    } else {
      expect(container.firstChild).toBeNull();
    }
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    renderModal({ onCancel });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onUploadConfirmation when upload button is clicked", () => {
    const onUploadConfirmation = vi.fn();
    renderModal({ onUploadConfirmation });
    fireEvent.click(screen.getByRole("button", { name: /upload/i }));
    expect(onUploadConfirmation).toHaveBeenCalled();
  });

  it("calls onFileNameChange when title input is changed", () => {
    const onFileNameChange = vi.fn();
    renderModal({ onFileNameChange });
    fireEvent.change(screen.getByDisplayValue("Test File"), {
      target: { value: "New Title" },
    });
    expect(onFileNameChange).toHaveBeenCalledWith("New Title");
  });

  it("renders PDF preview for non-image file", () => {
    renderModal({ file: file("test.pdf", "application/pdf") });
    expect(screen.getByText(/Upload file/)).toBeInTheDocument();
    // Check for the PDF preview container and icon
    const pdfPreview = document.querySelector(
      ".upload-file-modal__preview-pdf",
    );
    expect(pdfPreview).toBeInTheDocument();
    expect(pdfPreview?.querySelector(".fa-file-pdf")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test File")).toBeInTheDocument();
  });

  it.each(["", "   "])(
    "disables upload button if fileName is '%s'",
    (fileName) => {
      renderModal({ fileName });
      expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
    },
  );

  it("calls onFileNameChange with default title if file is present and fileName is empty", () => {
    const onFileNameChange = vi.fn();
    renderModal({
      file: file("test.pdf", "application/pdf"),
      fileName: "",
      onFileNameChange,
    });
    expect(onFileNameChange).toHaveBeenCalledWith("test");
  });
});
