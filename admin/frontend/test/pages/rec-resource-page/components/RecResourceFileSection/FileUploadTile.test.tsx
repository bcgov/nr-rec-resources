import { render, screen, fireEvent } from "@testing-library/react";
import { FileUploadTile } from "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadTile";

describe("FileUploadTile", () => {
  const renderTile = (props = {}) =>
    render(<FileUploadTile label="Upload" {...props} />);

  it("renders upload tile with label", () => {
    renderTile();
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
    expect(screen.getByTestId("upload-tile")).toBeInTheDocument();
  });

  it.each([
    [false, true],
    [true, false],
  ])(
    "calls onClick only if not disabled (disabled=%s)",
    (disabled, shouldCall) => {
      const onClick = vi.fn();
      renderTile({ onClick, disabled });
      fireEvent.click(screen.getByTestId("upload-tile"));
      if (shouldCall) expect(onClick).toHaveBeenCalled();
      else expect(onClick).not.toHaveBeenCalled();
    },
  );

  it("shows disabled class when disabled", () => {
    renderTile({ disabled: true });
    expect(screen.getByTestId("upload-tile")).toHaveClass("disabled");
  });
});
