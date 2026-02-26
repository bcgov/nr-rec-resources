import { EditPhotoModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/EditPhotoModal/EditPhotoModal';
import { recResourceFileTransferStore } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryImage } from '@/pages/rec-resource-page/types';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockMutateAsync = vi.fn();
const mockCreateImageConsent = vi.fn();

vi.mock('@/pages/rec-resource-page/hooks/useUpdateImageConsent', () => ({
  useUpdateImageConsent: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

vi.mock('@/services/hooks', () => ({
  useRecreationResourceAdminApiClient: () => ({
    createImageConsent: mockCreateImageConsent,
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: () => ({ rec_resource_id: 'REC0001' }),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections',
  () => ({
    ImageUploadForm: ({ onFormReady, onSubmitForm }: any) => {
      useEffect(() => {
        onFormReady({
          resetForm: vi.fn(),
          isValid: true,
          isDirty: true,
          submitForm: () =>
            onSubmitForm({
              displayName: 'Updated display name',
              dateCreated: new Date('2024-06-15'),
              containsIdentifiableInfo: null,
              photographerType: 'STAFF',
              photographerName: '',
            }),
        });
      }, [onFormReady, onSubmitForm]);
      return <div data-testid="mock-image-upload-form" />;
    },
  }),
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

const mockImage: GalleryImage = {
  id: 'img-1',
  name: 'test-photo.webp',
  date: 'January 1, 2024',
  url: 'https://example.com/original.jpg',
  extension: 'jpg',
  type: 'image',
  previewUrl: 'https://example.com/preview.jpg',
  variants: [],
  has_consent_metadata: true,
  photographer_name: 'John Doe',
  date_taken: '2024-06-15',
};

describe('EditPhotoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: false,
      selectedImageForEdit: null,
    }));
  });

  it('renders nothing when modal is closed', () => {
    const { container } = render(<EditPhotoModal />, {
      wrapper: TestQueryClientProvider,
    });
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with title and save button', () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: true,
      selectedImageForEdit: mockImage,
    }));

    render(<EditPhotoModal />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('Edit photo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-image-upload-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('submits patch flow for image with consent metadata', async () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: true,
      selectedImageForEdit: mockImage,
    }));

    render(<EditPhotoModal />, { wrapper: TestQueryClientProvider });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          recResourceId: 'REC0001',
          imageId: 'img-1',
          fileName: 'Updated display name',
        }),
      );
    });
  });

  it('submits create consent flow for legacy image without consent metadata', async () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: true,
      selectedImageForEdit: {
        ...mockImage,
        has_consent_metadata: false,
      },
    }));

    render(<EditPhotoModal />, { wrapper: TestQueryClientProvider });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCreateImageConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          recResourceId: 'REC0001',
          imageId: 'img-1',
          fileName: 'Updated display name',
          containsPii: undefined,
        }),
      );
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
