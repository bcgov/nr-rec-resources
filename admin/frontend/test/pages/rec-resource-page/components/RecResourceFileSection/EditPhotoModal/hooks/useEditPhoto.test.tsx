import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditPhoto } from '@/pages/rec-resource-page/components/RecResourceFileSection/EditPhotoModal/hooks/useEditPhoto';
import { recResourceFileTransferStore } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryImage } from '@/pages/rec-resource-page/types';

const mockUpdateImageConsent = vi.hoisted(() => vi.fn());
const mockCreateImageConsent = vi.hoisted(() => vi.fn());

vi.mock('@/services/hooks', () => ({
  useCreateImageConsent: () => ({
    mutateAsync: mockCreateImageConsent,
  }),
  useUpdateImageConsent: () => ({
    mutateAsync: mockUpdateImageConsent,
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: () => ({ rec_resource_id: 'REC0001' }),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

const baseImage: GalleryImage = {
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

describe('useEditPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: false,
      selectedImageForEdit: null,
    }));
  });

  it('submits update consent flow for images with consent metadata', async () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: true,
      selectedImageForEdit: baseImage,
    }));

    const { result } = renderHook(() => useEditPhoto());

    await act(async () => {
      await result.current.handleEditSubmit({
        displayName: 'Updated display name',
        dateCreated: new Date('2024-06-15'),
        containsIdentifiableInfo: null,
        photographerType: 'STAFF',
        photographerName: '',
      });
    });

    expect(mockUpdateImageConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        recResourceId: 'REC0001',
        imageId: 'img-1',
        fileName: 'Updated display name',
        dateTaken: '2024-06-15',
      }),
    );
    expect(mockCreateImageConsent).not.toHaveBeenCalled();
  });

  it('submits create consent flow for images without consent metadata', async () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: true,
      selectedImageForEdit: {
        ...baseImage,
        has_consent_metadata: false,
      },
    }));

    const { result } = renderHook(() => useEditPhoto());

    await act(async () => {
      await result.current.handleEditSubmit({
        displayName: 'Updated display name',
        dateCreated: new Date('2024-06-15'),
        containsIdentifiableInfo: null,
        photographerType: 'STAFF',
        photographerName: '',
      });
    });

    expect(mockCreateImageConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        recResourceId: 'REC0001',
        imageId: 'img-1',
        fileName: 'Updated display name',
        dateTaken: '2024-06-15',
        containsPii: undefined,
      }),
    );
    expect(mockUpdateImageConsent).not.toHaveBeenCalled();
  });

  it('hides modal on cancel', () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      showEditPhotoModal: true,
      selectedImageForEdit: baseImage,
    }));

    const { result } = renderHook(() => useEditPhoto());

    act(() => {
      result.current.handleCancel();
    });

    expect(recResourceFileTransferStore.state.showEditPhotoModal).toBe(false);
    expect(recResourceFileTransferStore.state.selectedImageForEdit).toBe(null);
  });
});
