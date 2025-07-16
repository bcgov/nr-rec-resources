import { RecreationResourceDetailModel } from "@/custom-models";
import { ResourceHeaderSection } from "@/pages/rec-resource-page/components/ResourceHeaderSection";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseRecResourceFileTransferState = vi.fn();

// Mock the helpers
vi.mock("@/pages/rec-resource-page/helpers", () => ({
  handleAddPdfFileClick: vi.fn(),
}));

vi.mock(
  "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState",
  () => ({
    useRecResourceFileTransferState: () =>
      mockUseRecResourceFileTransferState(),
  }),
);

vi.mock("@/components", () => ({
  CustomBadge: ({ label }: any) => (
    <span data-testid="custom-badge">{label}</span>
  ),
  CustomButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/clamp-lines", () => ({
  ClampLines: ({ text }: any) => <h1 data-testid="clamp-lines">{text}</h1>,
}));

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon.iconName || "mocked-icon"}
    />
  ),
}));

const baseResource = {
  rec_resource_id: "123",
  name: "Test Resource",
  rec_resource_type: "Park",
  recreation_status: {
    code: "Open",
    label: "Open",
    status_code: 1,
    comment: "",
    description: "",
  },
} as unknown as RecreationResourceDetailModel;

// Import the mocked function to access it in tests
import { handleAddPdfFileClick } from "@/pages/rec-resource-page/helpers";
const mockHandleAddPdfFileClick = vi.mocked(handleAddPdfFileClick);

describe("ResourceHeaderSection", () => {
  const defaultState = { isDocumentUploadDisabled: false };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRecResourceFileTransferState.mockReturnValue(defaultState);
  });

  it("renders resource name, id, and type", () => {
    render(<ResourceHeaderSection recResource={baseResource} />);
    expect(screen.getByTestId("clamp-lines")).toHaveTextContent(
      "Test Resource",
    );
    expect(screen.getByTestId("custom-badge")).toHaveTextContent("123");
    expect(screen.getByText("Park")).toBeInTheDocument();
  });

  it("calls handleAddPdfFileClick for Add image and Add document (desktop)", () => {
    render(<ResourceHeaderSection recResource={baseResource} />);

    // Get the desktop action buttons (they have d-none d-md-flex classes)
    const addImageButton = screen.getByRole("button", { name: /add image/i });
    const addDocumentButton = screen.getByRole("button", {
      name: /add document/i,
    });

    fireEvent.click(addImageButton);
    fireEvent.click(addDocumentButton);

    expect(mockHandleAddPdfFileClick).toHaveBeenCalledTimes(2);
  });

  it("disables Add document button if upload is disabled", () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      isDocumentUploadDisabled: true,
    });

    render(<ResourceHeaderSection recResource={baseResource} />);

    const addDocumentButton = screen.getByRole("button", {
      name: /add document/i,
    });
    expect(addDocumentButton).toBeDisabled();
  });

  it("shows dropdown actions on mobile", () => {
    // Simulate mobile by hiding desktop buttons
    window.HTMLElement.prototype.matches = () => false;
    render(<ResourceHeaderSection recResource={baseResource} />);
    expect(
      document.querySelector(".resource-header-section__ellipsis-toggle"),
    ).toBeTruthy();
  });
});
