import { render, screen } from "@testing-library/react";
import { RecResourcePageContent } from "@/pages/rec-resource-page/components";

const mockUseStore = vi.fn();

vi.mock("@tanstack/react-store", () => ({
  useStore: () => mockUseStore(),
}));
vi.mock("@/pages/rec-resource-page/components/ResourceHeaderSection", () => ({
  ResourceHeaderSection: ({ recResource }: any) => (
    <div data-testid="resource-header-section">{recResource?.name}</div>
  ),
}));
vi.mock("@/pages/rec-resource-page/components/RecResourceFileSection", () => ({
  RecResourceFileSection: ({ rec_resource_id }: any) => (
    <div data-testid="rec-resource-file-section">{rec_resource_id}</div>
  ),
}));
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: (props: any) => <svg data-testid="fa-icon" {...props} />,
}));

const baseResource = {
  rec_resource_id: "abc123",
  name: "Test Resource",
};

describe("RecResourcePageContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders error if recResource is not available", () => {
    mockUseStore.mockReturnValue({ recResource: null });
    render(<RecResourcePageContent />);
    expect(
      screen.getByText("Error: Recreation Resource data is not available."),
    ).toBeInTheDocument();
  });

  it("renders header, info banner, and file section if recResource is available", () => {
    mockUseStore.mockReturnValue({ recResource: baseResource });
    render(<RecResourcePageContent />);
    expect(screen.getByTestId("resource-header-section")).toHaveTextContent(
      "Test Resource",
    );
    expect(screen.getByTestId("fa-icon")).toBeInTheDocument();
    expect(
      screen.getByText(
        /All images and documents will be published to the beta website immediately\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("rec-resource-file-section")).toHaveTextContent(
      "abc123",
    );
  });
});
