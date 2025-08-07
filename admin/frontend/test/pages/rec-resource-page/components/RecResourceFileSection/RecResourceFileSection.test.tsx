import { RecResourceFileSection } from "@/pages/rec-resource-page/components/RecResourceFileSection";
import { fireEvent, render, screen } from "@testing-library/react";

const mockUseDocumentList = vi.fn();
const mockUseRecResourceFileTransferState = vi.fn();
const mockResetRecResourceFileTransferStore = vi.fn();

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  resetRecResourceFileTransferStore: () =>
    mockResetRecResourceFileTransferStore(),
}));

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
    GalleryFileCard: ({ file, getFileActionHandler }: any) => (
      <div data-testid="gallery-file-card">
        <button onClick={() => getFileActionHandler("view")(file)}>View</button>
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
    FileUploadModal: () => {
      const { uploadModalState } = mockUseRecResourceFileTransferState();
      return uploadModalState.showUploadOverlay &&
        uploadModalState.selectedFileForUpload ? (
        <div data-testid="upload-file-modal" />
      ) : null;
    },
  }),
);
vi.mock(
  "@/pages/rec-resource-page/components/RecResourceFileSection/DeleteFileModal",
  () => ({
    DeleteFileModal: () => <div data-testid="delete-file-modal" />,
  }),
);

describe("RecResourceFileSection", () => {
  const defaultState = {
    getDocumentGeneralActionHandler: vi.fn(() => vi.fn()),
    getDocumentFileActionHandler: vi.fn(() => vi.fn()),
    getImageGeneralActionHandler: vi.fn(() => vi.fn()),
    getImageFileActionHandler: vi.fn(() => vi.fn()),
    uploadModalState: {
      showUploadOverlay: false,
      uploadFileName: "",
      selectedFileForUpload: null,
    },
    galleryDocuments: [],
    galleryImages: [],
    isDocumentUploadDisabled: false,
    isImageUploadDisabled: false,
    isFetching: false,
    isFetchingImages: false,
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
    mockResetRecResourceFileTransferStore.mockClear();
  });

  it("renders gallery accordion and file cards", () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      galleryDocuments: [{ id: 1, name: "Doc1" }],
    });
    render(<RecResourceFileSection />);
    expect(screen.getAllByTestId("gallery-accordion")).toHaveLength(2); // One for documents, one for images
    expect(screen.getByTestId("gallery-file-card")).toBeInTheDocument();
    expect(screen.getByText("Doc1")).toBeInTheDocument();
  });

  it("calls action handler when upload tile is clicked", () => {
    const getDocumentGeneralActionHandler = vi.fn(() => vi.fn());
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      getDocumentGeneralActionHandler,
    });
    render(<RecResourceFileSection />);
    fireEvent.click(screen.getAllByTestId("upload-label")[0]); // Click first upload button
    expect(getDocumentGeneralActionHandler).toHaveBeenCalledWith("upload");
  });

  it("does not trigger onClick when upload is disabled", () => {
    const actionHandler = vi.fn();
    const getDocumentGeneralActionHandler = vi.fn(() => actionHandler);
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      getDocumentGeneralActionHandler,
      isDocumentUploadDisabled: true,
    });
    render(<RecResourceFileSection />);
    fireEvent.click(screen.getAllByTestId("upload-label")[0]); // Click first upload button
    expect(actionHandler).not.toHaveBeenCalled(); // Upload action should not be called
  });

  it("shows upload modal when uploadModalState has showUploadModal and selectedFile", () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      uploadModalState: {
        showUploadOverlay: true,
        selectedFileForUpload: { name: "file.pdf" },
        uploadFileName: "test.pdf",
      },
    });
    render(<RecResourceFileSection />);
    expect(screen.getByTestId("upload-file-modal")).toBeInTheDocument();
  });

  it("shows delete modal", () => {
    render(<RecResourceFileSection />);
    expect(screen.getByTestId("delete-file-modal")).toBeInTheDocument();
  });

  it("calls document action handler when file card action is clicked", () => {
    const docActionHandler = vi.fn();
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      galleryDocuments: [{ id: 1, name: "Doc1" }],
      getDocumentFileActionHandler: vi.fn(() => docActionHandler),
    });
    render(<RecResourceFileSection />);
    fireEvent.click(screen.getByText("View"));
    expect(docActionHandler).toHaveBeenCalled();
  });

  it("renders image cards and calls image action handler", () => {
    const imageActionHandler = vi.fn();
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      galleryImages: [
        {
          id: 1,
          name: "Image1.jpg",
          previewUrl: "http://example.com/image.jpg",
        },
      ],
      getImageFileActionHandler: vi.fn(() => imageActionHandler),
    });
    render(<RecResourceFileSection />);

    // Check that image is rendered
    expect(screen.getByText("Image1.jpg")).toBeInTheDocument();

    // Click the view action on image card
    fireEvent.click(screen.getByText("View"));
    expect(imageActionHandler).toHaveBeenCalled();
  });

  it("calls resetRecResourceFileTransferStore on component unmount", () => {
    const { unmount } = render(<RecResourceFileSection />);

    // Verify reset function was not called on mount
    expect(mockResetRecResourceFileTransferStore).not.toHaveBeenCalled();

    // Unmount the component to trigger cleanup
    unmount();

    // Verify reset function was called during cleanup
    expect(mockResetRecResourceFileTransferStore).toHaveBeenCalledTimes(1);
  });
});
