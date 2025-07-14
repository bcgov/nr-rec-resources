import { render, screen, fireEvent } from "@testing-library/react";
import { RecResourceFileSection } from "@/pages/rec-resource-page/components/RecResourceFileSection";

const mockUseDocumentList = vi.fn();
const mockUseRecResourceFileTransferState = vi.fn();
const baseDocs = [{ id: 1, name: "Doc1" }];
const basePending = [{ id: 2, name: "PendingDoc" }];

vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryAccordion",
  () => ({
    GalleryAccordion: ({
      items = [],
      renderItem,
      onFileUploadTileClick,
      uploadDisabled,
      uploadLabel,
    }: any) => (
      <div data-testid="gallery-accordion">
        {items.map(renderItem)}
        <button onClick={onFileUploadTileClick} disabled={uploadDisabled}>
          {uploadLabel}
        </button>
      </div>
    ),
  }),
);
vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard",
  () => ({
    GalleryFileCard: ({ file, onAction }: any) => (
      <div data-testid="gallery-file-card">
        <button onClick={() => onAction("view", file)}>View</button>
        <span>{file.name}</span>
      </div>
    ),
  }),
);
vi.mock("@/pages/rec-resource-page/hooks/useDocumentList", () => ({
  useDocumentList: () => mockUseDocumentList(),
}));
vi.mock(
  "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState",
  () => ({
    useRecResourceFileTransferState: () =>
      mockUseRecResourceFileTransferState(),
  }),
);
vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadModal",
  () => ({
    FileUploadModal: ({
      open,
      file,
      onFileNameChange,
      onUpload,
      onCancel,
      onUploadConfirmation,
    }: any) => {
      if (open && file) {
        // Call the callbacks for testing purposes
        if (onFileNameChange) onFileNameChange("changed.pdf");
        if (onUpload) onUpload();
        if (onCancel) onCancel();
        if (onUploadConfirmation) onUploadConfirmation();
        return <div data-testid="upload-file-modal" />;
      }
      return null;
    },
  }),
);

describe("RecResourceFileSection", () => {
  const defaultState = {
    selectedFile: null,
    uploadFileName: "",
    showUploadOverlay: false,
    pendingDocs: [],
    handleAddFileClick: vi.fn(),
    handleCancelUpload: vi.fn(),
    setUploadFileName: vi.fn(),
    getUploadHandler: vi.fn(() => vi.fn()),
    getDocumentActionHandler: vi.fn(() => vi.fn()),
  };
  const defaultList = {
    documents: baseDocs,
    isDocumentUploadDisabled: false,
    isFetching: false,
    refetch: vi.fn(),
  };
  beforeEach(() => {
    mockUseDocumentList.mockReturnValue(defaultList);
    mockUseRecResourceFileTransferState.mockReturnValue(defaultState);
  });

  it.each([
    ["renders with docs", {}, {}, 1, "Doc1"],
    [
      "renders with pending docs",
      {},
      { pendingDocs: basePending },
      2,
      "PendingDoc",
    ],
    [
      "renders with no docs or pending",
      { documents: [] },
      { pendingDocs: [] },
      0,
      null,
    ],
  ])("%s", (_, listMod, stateMod, count, text) => {
    mockUseDocumentList.mockReturnValue({ ...defaultList, ...listMod });
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      ...stateMod,
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    expect(screen.getByTestId("gallery-accordion")).toBeInTheDocument();
    expect(screen.queryAllByTestId("gallery-file-card")).toHaveLength(count);
    if (text) expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("calls onUploadClick when upload button is clicked", () => {
    const handleAddFileClick = vi.fn();
    mockUseRecResourceFileTransferState.mockReturnValueOnce({
      ...defaultState,
      handleAddFileClick,
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    fireEvent.click(screen.getByText("Upload"));
    expect(handleAddFileClick).toHaveBeenCalled();
  });

  it("disables upload button if upload is disabled", () => {
    mockUseDocumentList.mockReturnValueOnce({
      ...defaultList,
      isDocumentUploadDisabled: true,
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    expect(screen.getByText("Upload")).toBeDisabled();
  });

  it("shows upload modal when showUploadOverlay and selectedFile are set", () => {
    mockUseRecResourceFileTransferState.mockReturnValueOnce({
      ...defaultState,
      showUploadOverlay: true,
      selectedFile: { name: "file.pdf" },
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    expect(screen.getByTestId("upload-file-modal")).toBeInTheDocument();
  });

  it("renders loading state if isFetching is true", () => {
    mockUseDocumentList.mockReturnValueOnce({
      ...defaultList,
      isFetching: true,
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    expect(screen.getByTestId("gallery-accordion")).toBeInTheDocument();
  });

  it("calls document action handler when file card action is clicked", () => {
    const docActionHandler = vi.fn();
    mockUseRecResourceFileTransferState.mockReturnValueOnce({
      ...defaultState,
      getDocumentActionHandler: vi.fn(() => docActionHandler),
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    fireEvent.click(screen.getByText("View"));
    expect(docActionHandler).toHaveBeenCalled();
  });

  it("does not show upload modal if showUploadOverlay is true but selectedFile is null", () => {
    mockUseRecResourceFileTransferState.mockReturnValueOnce({
      ...defaultState,
      showUploadOverlay: true,
      selectedFile: null,
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    expect(screen.queryByTestId("upload-file-modal")).not.toBeInTheDocument();
  });

  it("calls all FileUploadModal callbacks when modal is open", () => {
    const setUploadFileName = vi.fn();
    const uploadHandler = vi.fn();
    const handleCancelUpload = vi.fn();
    mockUseRecResourceFileTransferState.mockReturnValueOnce({
      ...defaultState,
      showUploadOverlay: true,
      selectedFile: { name: "file.pdf" },
      setUploadFileName,
      getUploadHandler: vi.fn(() => uploadHandler),
      handleCancelUpload,
    });
    mockUseDocumentList.mockReturnValueOnce({
      ...defaultList,
      refetch: vi.fn(),
    });
    render(<RecResourceFileSection rec_resource_id="abc" />);
    expect(setUploadFileName).toHaveBeenCalledWith("changed.pdf");
    expect(uploadHandler).toHaveBeenCalled();
    expect(handleCancelUpload).toHaveBeenCalled();
  });
});
