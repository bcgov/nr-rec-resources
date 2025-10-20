import { RecResourceEstablishmentOrderSection } from '@/pages/rec-resource-page/components/RecResourceEstablishmentOrderSection';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as services from '@/services';
import * as fileUtils from '@/utils/fileUtils';
import * as notificationStore from '@/store/notificationStore';

vi.mock('@/services');
vi.mock('@/utils/fileUtils');
vi.mock('@/store/notificationStore');

describe('RecResourceEstablishmentOrderSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with loading state', () => {
    vi.mocked(services.useGetEstablishmentOrderDocs).mockReturnValue({
      data: [],
      isLoading: true,
    } as any);

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    expect(screen.getByText('Establishment orders')).toBeInTheDocument();
  });

  it('renders documents when loaded', () => {
    vi.mocked(services.useGetEstablishmentOrderDocs).mockReturnValue({
      data: [
        {
          s3_key: 'doc1',
          title: 'Test Document',
          url: 'https://example.com/doc.pdf',
          extension: 'pdf',
          created_at: '2023-01-15T00:00:00Z',
        },
      ],
      isLoading: false,
    } as any);

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    expect(screen.getByText('Establishment orders')).toBeInTheDocument();
  });

  it('handles download action successfully', async () => {
    const user = userEvent.setup();

    vi.mocked(services.useGetEstablishmentOrderDocs).mockReturnValue({
      data: [
        {
          s3_key: 'doc1',
          title: 'Test Document',
          url: 'https://example.com/doc.pdf',
          extension: 'pdf',
          created_at: '2023-01-15T00:00:00Z',
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(fileUtils.buildFileNameWithExtension).mockReturnValue(
      'Test Document.pdf',
    );
    vi.mocked(fileUtils.downloadUrlAsFile).mockResolvedValue(undefined);

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

    vi.mocked(services.useGetEstablishmentOrderDocs).mockReturnValue({
      data: [
        {
          s3_key: 'doc1',
          title: 'Test Document',
          url: 'https://example.com/doc.pdf',
          extension: 'pdf',
          created_at: '2023-01-15T00:00:00Z',
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(fileUtils.buildFileNameWithExtension).mockReturnValue(
      'Test Document.pdf',
    );
    vi.mocked(fileUtils.downloadUrlAsFile).mockRejectedValue(
      new Error('Download failed'),
    );

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await vi.waitFor(() => {
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

    vi.mocked(services.useGetEstablishmentOrderDocs).mockReturnValue({
      data: [
        {
          s3_key: 'doc1',
          title: 'Test Document',
          url: 'https://example.com/doc.pdf',
          extension: 'pdf',
          created_at: '2023-01-15T00:00:00Z',
        },
      ],
      isLoading: false,
    } as any);

    render(<RecResourceEstablishmentOrderSection recResourceId="123" />);

    const viewButton = screen.getByRole('button', { name: /view/i });
    await user.click(viewButton);

    expect(mockOpen).toHaveBeenCalledWith(
      'https://example.com/doc.pdf',
      '_blank',
    );
  });
});
