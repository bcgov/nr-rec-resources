import { LoadingState } from "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/LoadingState";
import { render, screen } from "@testing-library/react";

describe("LoadingState", () => {
  it("renders with correct label", () => {
    render(<LoadingState label="Uploading" />);

    expect(screen.getByText("Uploading")).toBeInTheDocument();
  });

  it("renders spinner with correct accessibility attributes", () => {
    render(<LoadingState label="Processing" />);

    const spinner = document.querySelector('[role="status"]');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Processing in progress");
  });

  it("renders Bootstrap spinner", () => {
    render(<LoadingState label="Loading" />);

    const spinner = document.querySelector(".spinner-border");
    expect(spinner).toBeInTheDocument();
  });

  it("has correct layout structure", () => {
    render(<LoadingState label="Downloading" />);

    const container = document.querySelector(".align-items-center");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("justify-content-center");
  });

  it("supports different label values", () => {
    const { rerender } = render(<LoadingState label="Uploading" />);
    expect(screen.getByText("Uploading")).toBeInTheDocument();

    rerender(<LoadingState label="Downloading" />);
    expect(screen.getByText("Downloading")).toBeInTheDocument();
    expect(screen.queryByText("Uploading")).not.toBeInTheDocument();
  });

  it("updates aria-label based on provided label", () => {
    const { rerender } = render(<LoadingState label="Saving" />);

    let spinner = document.querySelector('[role="status"]');
    expect(spinner).toHaveAttribute("aria-label", "Saving in progress");

    rerender(<LoadingState label="Loading" />);
    spinner = document.querySelector('[role="status"]');
    expect(spinner).toHaveAttribute("aria-label", "Loading in progress");
  });

  it("handles special characters in label", () => {
    const specialLabel = "Uploading file (100%)...";
    render(<LoadingState label={specialLabel} />);

    expect(screen.getByText(specialLabel)).toBeInTheDocument();
    const spinner = document.querySelector('[role="status"]');
    expect(spinner).toHaveAttribute(
      "aria-label",
      `${specialLabel} in progress`,
    );
  });
});
