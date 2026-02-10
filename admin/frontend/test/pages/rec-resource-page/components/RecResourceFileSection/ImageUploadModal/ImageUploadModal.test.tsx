import { ImageUploadModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal';
import * as fileTransferState from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import * as imageUploadFormHooks from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/hooks/useRecResourceFileTransferState');
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks',
);
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
  () => ({
    useGetRecreationResourceOptions: () => ({
      data: [{ options: [{ id: 'STAFF', label: 'Staff' }] }],
    }),
  }),
);

const mockUseImageUploadForm = vi.mocked(
  imageUploadFormHooks.useImageUploadForm,
);

const mockHandleGeneralAction = vi.fn();
const mockUseRecResourceFileTransferState = vi.mocked(
  fileTransferState.useRecResourceFileTransferState,
);

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    defaultValues: {
      displayName: 'test',
      dateCreated: null,
      didYouTakePhoto: true,
      containsIdentifiableInfo: false,
      photographerName: '',
      photographerType: 'STAFF',
      consentFormFile: null,
      confirmationChecked: true,
    },
  });

  mockUseImageUploadForm.mockReturnValue({
    control: form.control,
    handleSubmit: form.handleSubmit,
    errors: {},
    setValue: form.setValue,
    resetForm: vi.fn(),
    isUploadEnabled: true,
    showDateWarning: false,
    showTakenDuringWorkingHours: true,
    showNameField: false,
    showConsentUpload: false,
    consentFormFile: null,
    handleConsentFileSelect: vi.fn(),
    handleConsentFileRemove: vi.fn(),
  });

  return <TestQueryClientProvider>{children}</TestQueryClientProvider>;
};

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
      wrapper: TestWrapper,
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
      wrapper: TestWrapper,
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders modal for image files', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestWrapper });

    expect(screen.getByText('Upload photo')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(
      screen.getByRole('form', { name: 'image-upload-form' }),
    ).toBeInTheDocument();
  });

  it('handles cancel button click', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestWrapper });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockHandleGeneralAction).toHaveBeenCalledWith('cancel-upload');
  });

  it('handles upload button click when enabled', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestWrapper });

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    expect(mockHandleGeneralAction).toHaveBeenCalledWith('confirm-upload');
  });

  it('displays info alert about publishing to public website', () => {
    setMockState({
      showUploadOverlay: true,
      selectedFileForUpload: createFile(),
    });
    render(<ImageUploadModal />, { wrapper: TestWrapper });

    expect(
      screen.getByText(
        /uploading this photo will publish to the public website/i,
      ),
    ).toBeInTheDocument();
  });
});
