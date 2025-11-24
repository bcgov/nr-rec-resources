import { RecResourceEstablishmentOrderSection } from '@/pages/rec-resource-page/components/RecResourceEstablishmentOrderSection';
import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as services from '@/services';
import * as fileUtils from '@/utils/fileUtils';
import * as notificationStore from '@/store/notificationStore';
import { handleApiError } from '@/services/utils/errorHandler';

vi.mock('@/services');
vi.mock('@/utils/fileUtils');
vi.mock('@/store/notificationStore');
vi.mock('@/services/utils/errorHandler');
vi.mock('@/pages/rec-resource-page/validation/fileUploadSchema', () => ({
  createFileUploadValidator: vi.fn(() => ({
    safeParse: vi.fn(() => ({ success: true, data: {} })),
  })),
}));

const mockDocs = [
  {
    s3_key: 'doc1',
    title: 'Test Document',
    url: 'https://example.com/doc.pdf',
    extension: 'pdf',
    created_at: '2023-01-15T00:00:00Z',
  },
];

const mockRefetch = vi.fn();
const mockUploadMutation = vi.fn();
const mockDeleteMutation = vi.fn();

const setupMocks = (docs = mockDocs, isLoading = false) => {
  vi.mocked(services.useGetEstablishmentOrderDocs).mockReturnValue({
    data: docs,
    isLoading,
    refetch: mockRefetch,
  } as any);

  vi.mocked(services.useUploadEstablishmentOrderDoc).mockReturnValue({
    mutateAsync: mockUploadMutation,
  } as any);

  vi.mocked(services.useDeleteEstablishmentOrderDoc).mockReturnValue({
    mutateAsync: mockDeleteMutation,
  } as any);

  vi.mocked(fileUtils.getFileNameWithoutExtension).mockImplementation((file) =>
    file.name.replace(/\.[^/.]+$/, ''),
  );
  vi.mocked(fileUtils.buildFileNameWithExtension).mockImplementation(
    (name, ext) => `${name}.${ext}`,
  );
  vi.mocked(fileUtils.downloadUrlAsFile).mockResolvedValue(undefined);

  vi.mocked(handleApiError).mockResolvedValue({
    statusCode: 500,
    message: 'Error occurred',
    isResponseError: false,
    isAuthError: false,
  });
};

describe('RecResourceEstablishmentOrderSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    setupMocks();
  });

  afterEach(() => {
    // Ensure any hidden file inputs created by upload handler are removed
    document
      .querySelectorAll('input[type="file"]')
      .forEach((el) => el.parentElement?.removeChild(el));
  });

  const generateDocs = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      s3_key: `doc${i + 1}`,
      title: `Document ${i + 1}`,
      url: `https://example.com/doc${i + 1}.pdf`,
      extension: 'pdf',
      created_at: '2023-01-15T00:00:00Z',
    }));

  it('renders with loading state', () => {
    setupMocks([], true);

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    expect(screen.getByText('Establishment orders')).toBeInTheDocument();
  });

  it('renders documents when loaded', () => {
    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    expect(screen.getByText('Establishment orders')).toBeInTheDocument();
  });

  it('handles download action successfully', async () => {
    const user = userEvent.setup();

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    expect(fileUtils.buildFileNameWithExtension).toHaveBeenCalledWith(
      'Test Document',
      'pdf',
    );
    expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
      'Downloading "Test Document.pdf"...',
    );
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      'https://example.com/doc.pdf',
      'Test Document.pdf',
    );
  });

  it('handles download failure with error notification', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.mocked(fileUtils.downloadUrlAsFile).mockRejectedValue(
      new Error('Download failed'),
    );

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        'Failed to download "Test Document.pdf". Please try again.',
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles view action by opening document in new window', async () => {
    const user = userEvent.setup();
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    const viewButton = screen.getByRole('button', { name: /view/i });
    await user.click(viewButton);

    expect(mockOpen).toHaveBeenCalledWith(
      'https://example.com/doc.pdf',
      '_blank',
    );
  });

  describe('upload functionality', () => {
    it('renders upload button', () => {
      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('creates file input element for uploads', async () => {
      const user = userEvent.setup();

      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      const uploadButton = screen.getByText('Upload');
      await user.click(uploadButton);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'application/pdf');
    });

    it('shows description with maximum documents info', () => {
      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);
      expect(screen.getByText(/Maximum 30 documents\./i)).toBeInTheDocument();
    });

    it('disables upload and shows warning when max uploads reached', async () => {
      const user = userEvent.setup();

      setupMocks(generateDocs(30), false);
      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      const uploadTile = screen.getByTestId('upload-tile');
      expect(uploadTile).toHaveClass('disabled');
      expect(screen.getByText('Upload')).toBeInTheDocument();

      expect(
        screen.getByText(
          /Upload limit reached\. Maximum 30 documents allowed\./i,
        ),
      ).toBeInTheDocument();

      await user.click(uploadTile);
      expect(
        document.querySelector('input[type="file"]'),
      ).not.toBeInTheDocument();
    });

    it('does not show warning and allows upload when below max', async () => {
      const user = userEvent.setup();

      setupMocks(generateDocs(2), false);
      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      expect(
        screen.queryByText(
          /Upload limit reached\. Maximum 30 documents allowed\./i,
        ),
      ).not.toBeInTheDocument();

      const uploadTile = screen.getByTestId('upload-tile');
      await user.click(uploadTile);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'application/pdf');
    });
  });

  describe('delete functionality', () => {
    it('opens delete modal when clicking delete button', async () => {
      const user = userEvent.setup();

      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      const deleteButton = screen.getAllByRole('button', {
        name: /delete/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(
          within(modal).getByText(
            /Are you sure you want to delete this establishment order\?/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('deletes file successfully', async () => {
      const user = userEvent.setup();

      mockDeleteMutation.mockResolvedValueOnce({ success: true });

      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      const deleteButton = screen.getAllByRole('button', {
        name: /delete/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      const confirmButton = within(modal).getByRole('button', {
        name: /delete/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteMutation).toHaveBeenCalledWith({
          recResourceId: '123',
          s3Key: 'doc1',
        });
        expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
          'Establishment order "Test Document" deleted successfully.',
        );
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('handles delete error', async () => {
      const user = userEvent.setup();

      mockDeleteMutation.mockRejectedValueOnce(new Error('Delete failed'));

      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      const deleteButton = screen.getAllByRole('button', {
        name: /delete/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      const confirmButton = within(modal).getByRole('button', {
        name: /delete/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          '500 - Failed to delete establishment order "Test Document": Error occurred. Please try again.',
        );
      });
    });

    it('cancels delete when clicking cancel', async () => {
      const user = userEvent.setup();

      render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

      const deleteButton = screen.getAllByRole('button', {
        name: /delete/i,
      })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      const cancelButton = within(modal).getByRole('button', {
        name: /cancel/i,
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(mockDeleteMutation).not.toHaveBeenCalled();
    });
  });
});
