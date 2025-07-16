import { RecResourceFileSection } from "@/pages/rec-resource-page/components/RecResourceFileSection";
import { fireEvent, render, screen } from "@testing-library/react";

const mockUseDocumentList = vi.fn();
const mockUseRecResourceFileTransferState = vi.fn();

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
        <span
          data-testid="upload-label"
          onClick={uploadDisabled ? undefined : onFileUploadTileClick}
        >
          {uploadLabel}
        </span>
        {items.map(renderItem)}
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
    FileUploadModal: ({ open, file }: any) =>
      open && file ? <div data-testid="upload-file-modal" /> : null,
  }),
);
vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal",
  () => ({
    DeleteFileModal: ({ open, file }: any) =>
      open && file ? <div data-testid="delete-file-modal" /> : null,
  }),
);

describe("RecResourceFileSection", () => {
  const defaultState = {
    getActionHandler: vi.fn(() => vi.fn()),
    uploadModalState: {
      showUploadModal: false,
      resetUploadModal: vi.fn(),
    },
    galleryDocuments: [],
    isDocumentUploadDisabled: false,
    isFetching: false,
    refetch: vi.fn(),
    showDeleteModal: false,
    docToDelete: null,
    setShowDeleteModal: vi.fn(),
    setDocToDelete: vi.fn(),
    handleAddFileClick: vi.fn(),
  };
  const defaultList = {
    documents: [{ id: 1, name: "Doc1" }],
    isDocumentUploadDisabled: false,
    isFetching: false,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    mockUseDocumentList.mockReturnValue(defaultList);
    mockUseRecResourceFileTransferState.mockReturnValue(defaultState);
  });

  it("renders gallery accordion and file cards", () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      galleryDocuments: [{ id: 1, name: "Doc1" }],
    });
    render(<RecResourceFileSection />);
    expect(screen.getByTestId("gallery-accordion")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-file-card")).toBeInTheDocument();
    expect(screen.getByText("Doc1")).toBeInTheDocument();
  });

  it("calls action handler when upload tile is clicked", () => {
    const getActionHandler = vi.fn(() => vi.fn());
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      getActionHandler,
    });
    render(<RecResourceFileSection />);
    fireEvent.click(screen.getByTestId("upload-label"));
    expect(getActionHandler).toHaveBeenCalled();
  });

  it("does not trigger onClick when upload is disabled", () => {
    const actionHandler = vi.fn();
    const getActionHandler = vi.fn(() => actionHandler);
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      getActionHandler,
      isDocumentUploadDisabled: true,
    });
    render(<RecResourceFileSection />);
    fireEvent.click(screen.getByTestId("upload-label"));
    expect(actionHandler).not.toHaveBeenCalled(); // Upload action should not be called
  });

  it("shows upload modal when uploadModalState has showUploadModal and selectedFile", () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      uploadModalState: {
        showUploadModal: true,
        selectedFile: { name: "file.pdf" },
        uploadFileName: "test.pdf",
        setUploadFileName: vi.fn(),
        resetUploadModal: vi.fn(),
      },
    });
    render(<RecResourceFileSection />);
    expect(screen.getByTestId("upload-file-modal")).toBeInTheDocument();
  });

  it("shows delete modal when showDeleteModal and docToDelete are set", () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      showDeleteModal: true,
      docToDelete: { id: 2, name: "DeleteMe.pdf" },
    });
    render(<RecResourceFileSection />);
    expect(screen.getByTestId("delete-file-modal")).toBeInTheDocument();
  });

  it("calls document action handler when file card action is clicked", () => {
    const docActionHandler = vi.fn();
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      galleryDocuments: [{ id: 1, name: "Doc1" }],
      getActionHandler: vi.fn(() => docActionHandler),
    });
    render(<RecResourceFileSection />);
    fireEvent.click(screen.getByText("View"));
    expect(docActionHandler).toHaveBeenCalled();
  });
});
