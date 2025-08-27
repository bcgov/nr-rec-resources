import { RecResourceFilesPage } from "@/pages/rec-resource-page/RecResourceFilesPage";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock the RecResourceFileSection component
vi.mock("@/pages/rec-resource-page/components/RecResourceFileSection", () => ({
  RecResourceFileSection: () => (
    <div data-testid="rec-resource-file-section">
      Mock RecResourceFileSection
    </div>
  ),
}));

describe("RecResourceFilesPage", () => {
  it("renders the InfoBanner component", () => {
    render(<RecResourceFilesPage />);

    // Check for info banner elements
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(
        /All images and documents will be published to the beta website within 15 minutes/,
      ),
    ).toBeInTheDocument();
  });

  it("renders the info banner with correct warning variant", () => {
    render(<RecResourceFilesPage />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert-warning");
  });

  it("renders the info banner with information icon", () => {
    render(<RecResourceFilesPage />);

    const icon = screen.getByLabelText("Information");
    expect(icon).toBeInTheDocument();
  });

  it("renders the RecResourceFileSection component", () => {
    render(<RecResourceFilesPage />);

    expect(screen.getByTestId("rec-resource-file-section")).toBeInTheDocument();
  });

  it("has correct layout structure with Stack", () => {
    const { container } = render(<RecResourceFilesPage />);

    // Check that the main container has the correct structure
    const stackElement = container.firstChild as HTMLElement;
    expect(stackElement).toHaveClass("vstack", "gap-4");
  });

  it("has gap between info banner and file section", () => {
    const { container } = render(<RecResourceFilesPage />);

    const stackElement = container.firstChild as HTMLElement;
    expect(stackElement).toHaveClass("gap-4");
  });

  it("renders info banner text content correctly", () => {
    render(<RecResourceFilesPage />);

    expect(
      screen.getByText(
        "All images and documents will be published to the beta website within 15 minutes.",
      ),
    ).toBeInTheDocument();
  });

  it("has correct CSS classes for info banner", () => {
    render(<RecResourceFilesPage />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("rec-resource-page__info-banner");
  });

  it("has correct horizontal stack layout in info banner", () => {
    render(<RecResourceFilesPage />);

    const stackElement = screen.getByRole("alert").querySelector(".hstack");
    expect(stackElement).toHaveClass("gap-2");
  });

  it("has correctly styled icon in info banner", () => {
    render(<RecResourceFilesPage />);

    const icon = screen.getByLabelText("Information");
    expect(icon).toHaveClass("rec-resource-page__info-banner-icon");
  });

  it("has correctly styled text in info banner", () => {
    render(<RecResourceFilesPage />);

    const textElement = screen.getByText(
      "All images and documents will be published to the beta website within 15 minutes.",
    );
    expect(textElement).toHaveClass("rec-resource-page__info-banner-text");
  });
});
