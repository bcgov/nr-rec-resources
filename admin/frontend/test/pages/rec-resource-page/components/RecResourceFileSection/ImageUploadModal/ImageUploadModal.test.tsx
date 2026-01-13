import { ImageUploadModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal';
import * as fileTransferState from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/hooks/useRecResourceFileTransferState');
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks',
  () => ({
    useImageUploadForm: vi.fn(() => ({
      control: {},
      resetForm: vi.fn(),
      uploadState: 'ready',
      isUploadEnabled: true,
    })),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections',
  () => ({
    ImageUploadForm: () => (
      <div data-testid="image-upload-form">Privacy Form</div>
    ),
  }),
);

const mockHandleGeneralAction = vi.fn();
const mockUseRecResourceFileTransferState = vi.mocked(
  fileTransferState.useRecResourceFileTransferState,
);

describe('ImageUploadModal', () => {
  const createFile = (
    name = 'test.jpg',
    fileType = 'image/jpeg',
    galleryType: 'image' | 'document' = 'image',
  ) => ({
    id: 'test-id',
    name,
    date: '2023-01-01',
    url: 'https://example.com/image.jpg',
    extension: name.split('.').pop() || 'jpg',
    type: galleryType,
    pendingFile: new File(['test content'], name, { type: fileType }),
  });

  const setMockState = (state: {
    showUploadOverlay?: boolean;
    selectedFileForUpload?: any;
  }) => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      uploadModalState: {
        showUploadOverlay: state.showUploadOverlay ?? false,
        selectedFileForUpload: state.selectedFileForUpload ?? null,
        uploadFileName: '',
        fileNameError: null,
      },
      getImageGeneralActionHandler: vi.fn(
        (action) => () => mockHandleGeneralAction(action),
      ),
    } as any);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setMockState({});
  });

  it('returns null when modal is not shown', () => {
    setMockState({ showUploadOverlay: false, selectedFileForUpload: null });
    const { container } = render(<ImageUploadModal />, {
      wrapper: TestQueryClientProvider,
    });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when file is not an image', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(
        'test.pdf',
        'application/pdf',
        'document',
      ),
    });
    const { container } = render(<ImageUploadModal />, {
      wrapper: TestQueryClientProvider,
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders modal for image files', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(screen.getByTestId('image-upload-form')).toBeInTheDocument();
  });

  it('handles cancel button click', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestQueryClientProvider });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockHandleGeneralAction).toHaveBeenCalledWith('cancel-upload');
  });

  it('handles upload button click when enabled', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestQueryClientProvider });

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    expect(mockHandleGeneralAction).toHaveBeenCalledWith('confirm-upload');
  });

  it('displays info alert about publishing to public website', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestQueryClientProvider });

    expect(
      screen.getByText(
        /uploading this photo will publish to the public website/i,
      ),
    ).toBeInTheDocument();
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('base-file-modal__alert');
    expect(alertElement).toHaveClass('base-file-modal__alert--info');
  });
});
