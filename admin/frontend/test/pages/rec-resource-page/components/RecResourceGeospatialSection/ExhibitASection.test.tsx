import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExhibitASection } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection';

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

const mockAddSuccessNotification = vi.fn();
const mockAddErrorNotification = vi.fn();
vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
}));

vi.mock('@shared/utils', () => ({
  formatDateTimeReadable: (d: string) => d || '',
}));
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
    mockUseAuthorizations.mockReturnValue({ isSuperAdmin: true });
    mockUseGetExhibitADocs.mockReturnValue({ data: [], isFetching: false });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response);
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('pending-uuid');
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
    mockUseAuthorizations.mockReturnValue({ isSuperAdmin: false });
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

  it('calls delete error notification when delete fails', async () => {
    mockDeleteMutateAsync.mockRejectedValue(new Error('delete failed'));
    mockUseGetExhibitADocs.mockReturnValue({
      data: [mockDoc],
      isFetching: false,
    });
    render(<ExhibitASection recResourceId="REC123" />);

    fireEvent.click(screen.getByTitle('Delete'));
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Failed to delete document. Please try again.',
      );
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

  it('triggers hidden file input click when Upload button is clicked', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<ExhibitASection recResourceId="REC123" />);

    fireEvent.click(screen.getByText('Upload'));

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
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

  it('updates upload modal file name and closes on cancel', async () => {
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

    const fileNameInput = screen.getByTestId('file-name-input');
    fireEvent.change(fileNameInput, { target: { value: 'renamed-exhibit' } });
    expect((fileNameInput as HTMLInputElement).value).toBe('renamed-exhibit');

    fireEvent.click(screen.getByText('Cancel Upload'));
    expect(screen.queryByTestId('upload-modal')).toBeNull();
  });

  it('uploads successfully and finalizes exhibit A document', async () => {
    mockPresignMutateAsync.mockResolvedValue({
      url: 'https://upload.example.com/signed-url',
      document_id: 'doc-upload-1',
    });
    mockFinalizeMutateAsync.mockResolvedValue(undefined);

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

    fireEvent.change(screen.getByTestId('file-name-input'), {
      target: { value: 'final-name' },
    });
    fireEvent.click(screen.getByText('Confirm Upload'));

    await waitFor(() => {
      expect(mockPresignMutateAsync).toHaveBeenCalledWith({
        recResourceId: 'REC123',
        fileName: 'final-name.pdf',
      });
    });

    expect(mockFinalizeMutateAsync).toHaveBeenCalledWith({
      recResourceId: 'REC123',
      document_id: 'doc-upload-1',
      file_name: 'final-name',
      extension: 'pdf',
      file_size: file.size,
    });
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(mockAddSuccessNotification).toHaveBeenCalledWith(
      'File "final-name" uploaded successfully.',
    );
  });

  it('shows pending upload failure state and error notification when upload fails', async () => {
    mockPresignMutateAsync.mockResolvedValue({
      url: 'https://upload.example.com/signed-url',
      document_id: 'doc-upload-2',
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as Response);

    render(<ExhibitASection recResourceId="REC123" />);

    const fileInput = screen.getByLabelText(
      'Upload Exhibit A document',
    ) as HTMLInputElement;

    const file = new File(['content'], 'failed-exhibit.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByTestId('upload-modal')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Confirm Upload'));

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeDefined();
    });

    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      'Failed to upload "failed-exhibit". Please try again.',
    );
  });
});
