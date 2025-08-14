import { RecResourcePage } from "@/pages/rec-resource-page";
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/pages/rec-resource-page/hooks/useRecResource", () => ({
  useRecResource: vi.fn(),
}));
vi.mock("@/pages/rec-resource-page/components/ResourceHeaderSection", () => ({
  ResourceHeaderSection: ({ recResource }: any) => (
    <div data-testid="resource-header-section">{recResource?.name}</div>
  ),
}));
vi.mock("@/pages/rec-resource-page/components/RecResourceFileSection", () => ({
  RecResourceFileSection: () => (
    <div data-testid="rec-resource-file-section">File Section</div>
  ),
}));
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: (props: any) => <svg data-testid="fa-icon" {...props} />,
}));

const baseResource = {
  rec_resource_id: "abc123",
  name: "Test Resource",
  closest_community: "Test Community",
  recreation_activity: [],
  recreation_status: { status_code: 1, comment: "", description: "Open" },
  rec_resource_type: "RR",
  description: "Test description",
  driving_directions: "Test directions",
  maintenance_standard_code: "U" as const,
  campsite_count: 0,
  recreation_access: [],
  recreation_structure: { has_toilet: false, has_table: false },
};

describe("RecResourcePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when there is an error", () => {
    const mockError = new Error("Failed to load resource");
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "abc123",
      recResource: undefined,
      isLoading: false,
      error: mockError,
    });
    const { container } = render(<RecResourcePage />);
    // Should render nothing (null) when there's an error
    expect(container.firstChild).toBeNull();
  });

  it("renders loading spinner when loading", () => {
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "abc123",
      recResource: undefined,
      isLoading: true,
      error: null,
    });
    render(<RecResourcePage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Loading recreation resource"),
    ).toBeInTheDocument();
  });

  it("renders loading spinner when recResource is not available and not loading", () => {
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: undefined,
      recResource: undefined,
      isLoading: false,
      error: null,
    });
    render(<RecResourcePage />);
    // Should show loading spinner when recResource is not available and not loading
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders header, info banner, and file section if recResource is available", () => {
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "abc123",
      recResource: baseResource,
      isLoading: false,
      error: null,
    });
    render(<RecResourcePage />);
    expect(screen.getByTestId("resource-header-section")).toHaveTextContent(
      "Test Resource",
    );
    expect(screen.getByTestId("fa-icon")).toBeInTheDocument();
    expect(
      screen.getByText(
        /All images and documents will be published to the beta website within 15 minutes\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("rec-resource-file-section")).toHaveTextContent(
      "File Section",
    );
  });
});
