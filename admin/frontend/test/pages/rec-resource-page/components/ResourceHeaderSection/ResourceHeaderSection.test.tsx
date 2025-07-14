import { render, screen, fireEvent } from "@testing-library/react";
import { ResourceHeaderSection } from "@/pages/rec-resource-page/components/ResourceHeaderSection";
import { RecreationResourceDetailModel } from "@/custom-models";

const mockUseRecResourceFileTransferState = vi.fn();
const mockUseDocumentList = vi.fn();

vi.mock(
  "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState",
  () => ({
    useRecResourceFileTransferState: () =>
      mockUseRecResourceFileTransferState(),
  }),
);
vi.mock("@/pages/rec-resource-page/hooks/useDocumentList", () => ({
  useDocumentList: () => mockUseDocumentList(),
}));
vi.mock("@/components", () => ({
  CustomBadge: ({ label }: any) => (
    <span data-testid="custom-badge">{label}</span>
  ),
  CustomButton: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@/components/clamp-lines", () => ({
  ClampLines: ({ text }: any) => <h1 data-testid="clamp-lines">{text}</h1>,
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

describe("ResourceHeaderSection", () => {
  const defaultState = { handleAddFileClick: vi.fn() };
  const defaultList = { isDocumentUploadDisabled: false };

  beforeEach(() => {
    mockUseRecResourceFileTransferState.mockReturnValue(defaultState);
    mockUseDocumentList.mockReturnValue(defaultList);
  });

  it("renders resource name, id, and type", () => {
    render(<ResourceHeaderSection recResource={baseResource} />);
    expect(screen.getByTestId("clamp-lines")).toHaveTextContent(
      "Test Resource",
    );
    expect(screen.getByTestId("custom-badge")).toHaveTextContent("123");
    expect(screen.getByText("Park")).toBeInTheDocument();
  });

  it("calls handleAddFileClick for Add image and Add document (desktop)", () => {
    render(<ResourceHeaderSection recResource={baseResource} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // Add image
    fireEvent.click(buttons[1]); // Add document
    expect(defaultState.handleAddFileClick).toHaveBeenCalledTimes(2);
  });

  it("disables Add document button if upload is disabled", () => {
    mockUseDocumentList.mockReturnValueOnce({ isDocumentUploadDisabled: true });
    render(<ResourceHeaderSection recResource={baseResource} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled();
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
