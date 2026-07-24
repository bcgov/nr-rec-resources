import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock hooks ────────────────────────────────────────────────────────────────
const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

const mockUseGetExhibitADocs = vi.fn();
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetExhibitADocs',
  () => ({
    useGetExhibitADocs: (...args: any[]) => mockUseGetExhibitADocs(...args),
  }),
);

const mockPresignMutateAsync = vi.fn();
const mockFinalizeMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks',
  () => ({
    usePresignExhibitAUpload: () => ({
      mutateAsync: mockPresignMutateAsync,
      isPending: false,
    }),
    useFinalizeExhibitAUpload: () => ({
      mutateAsync: mockFinalizeMutateAsync,
      isPending: false,
    }),
    useDeleteExhibitADoc: () => ({
      mutateAsync: mockDeleteMutateAsync,
    }),
  }),
);

const mockDownloadMutate = vi.fn();
vi.mock('@/pages/rec-resource-page/hooks/useFileDownload', () => ({
  useFileDownload: () => ({ mutate: mockDownloadMutate }),
}));

vi.mock('@/components/delete-confirmation-modal/DeleteFileModal', () => ({
  DeleteFileModal: ({ show, onCancel, onConfirm, title }: any) =>
    show ? (
      <div data-testid="delete-modal">
        <span>{title}</span>
        <button onClick={onCancel}>Cancel Delete</button>
        <button onClick={onConfirm}>Confirm Delete</button>
      </div>
    ) : null,
}));

vi.mock('@/components/file/DocumentUploadModal', () => ({
  DocumentUploadModal: ({
    show,
    onCancel,
    onConfirm,
    title,
    onFileNameChange,
    fileName,
  }: any) =>
    show ? (
      <div data-testid="upload-modal">
        <span>{title}</span>
        <input
          data-testid="file-name-input"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
        />
        <button onClick={onCancel}>Cancel Upload</button>
        <button onClick={onConfirm}>Confirm Upload</button>
      </div>
    ) : null,
}));

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: vi.fn(),
  addErrorNotification: vi.fn(),
}));

vi.mock('@shared/utils', () => ({
  formatDateTimeReadable: (d: string) => d || '',
}));

// ── Import component ──────────────────────────────────────────────────────────
import { ExhibitASection } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection';

const mockDoc = {
  document_id: 'doc-1',
  file_name: 'exhibit-a.pdf',
  url: 'https://s3.example.com/exhibit-a.pdf',
  extension: 'pdf',
  created_at: '2024-01-01T00:00:00Z',
};

describe('ExhibitASection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthorizations.mockReturnValue({ canSuperAdmin: true });
    mockUseGetExhibitADocs.mockReturnValue({ data: [], isFetching: false });
  });

  it('renders the Exhibit A heading', () => {
    render(<ExhibitASection recResourceId="REC123" />);
    expect(screen.getByText('Exhibit A')).toBeDefined();
  });

  it('shows empty state message when no documents', () => {
    render(<ExhibitASection recResourceId="REC123" />);
    expect(
      screen.getByText('No Exhibit A documents uploaded yet.'),
    ).toBeDefined();
  });

  it('shows upload button when user is superAdmin', () => {
    render(<ExhibitASection recResourceId="REC123" />);
    expect(screen.getByText('Upload')).toBeDefined();
  });

  it('hides upload button when user is not superAdmin', () => {
    mockUseAuthorizations.mockReturnValue({ canSuperAdmin: false });
    render(<ExhibitASection recResourceId="REC123" />);
    expect(screen.queryByText('Upload')).toBeNull();
  });

  it('shows spinner when fetching', () => {
    mockUseGetExhibitADocs.mockReturnValue({ data: [], isFetching: true });
    render(<ExhibitASection recResourceId="REC123" />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('renders document cards when docs are present', () => {
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);
    expect(screen.getByText('exhibit-a.pdf')).toBeDefined();
  });

  it('opens delete modal when delete button is clicked', () => {
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);

    const deleteBtn = screen.getByTitle('Delete');
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId('delete-modal')).toBeDefined();
    expect(screen.getByText('Delete Exhibit A document')).toBeDefined();
  });

  it('closes delete modal on cancel', () => {
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);

    fireEvent.click(screen.getByTitle('Delete'));
    expect(screen.getByTestId('delete-modal')).toBeDefined();

    fireEvent.click(screen.getByText('Cancel Delete'));
    expect(screen.queryByTestId('delete-modal')).toBeNull();
  });

  it('calls delete mutation on confirm and invalidates query', async () => {
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);

    fireEvent.click(screen.getByTitle('Delete'));
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
        recResourceId: 'REC123',
        documentId: 'doc-1',
      });
    });
  });

  it('opens file in new tab when View is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);

    fireEvent.click(screen.getByTitle('View'));
    expect(openSpy).toHaveBeenCalledWith(mockDoc.url, '_blank');
    openSpy.mockRestore();
  });

  it('calls download mutation when Download is clicked', () => {
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);

    fireEvent.click(screen.getByTitle('Download'));
    expect(mockDownloadMutate).toHaveBeenCalled();
  });

  it('hides the upload button when max files are reached', () => {
    // Create 50 docs (MAX_EXHIBIT_A_FILES)
    const docs = Array.from({ length: 50 }, (_, i) => ({
      ...mockDoc,
      document_id: `doc-${i}`,
    }));
    mockUseGetExhibitADocs.mockReturnValue({ data: docs, isFetching: false });
    render(<ExhibitASection recResourceId="REC123" />);
    expect(screen.queryByText('Upload')).toBeNull();
  });

  it('shows upload modal when a file is selected', async () => {
    render(<ExhibitASection recResourceId="REC123" />);

    const fileInput = screen.getByLabelText(
      'Upload Exhibit A document',
    ) as HTMLInputElement;

    const file = new File(['content'], 'my-exhibit.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByTestId('upload-modal')).toBeDefined();
    });
    expect(screen.getByText('Upload Exhibit A document')).toBeDefined();
  });
});
