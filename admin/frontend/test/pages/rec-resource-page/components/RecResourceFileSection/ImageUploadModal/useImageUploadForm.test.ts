import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks/useImageUploadForm';
import {
  setUploadFileName,
  setUploadConsentMetadata,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
  setUploadConsentMetadata: vi.fn(),
}));

describe('useImageUploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with display name without extension and syncs to store', () => {
      renderHook(() => useImageUploadForm('test-image.jpg'));

      expect(setUploadFileName).toHaveBeenCalledWith('test-image');
    });

    it('handles undefined initialDisplayName without setting store', () => {
      renderHook(() => useImageUploadForm(undefined));

      // Hook doesn't call setUploadFileName when no name is provided
      expect(setUploadFileName).not.toHaveBeenCalled();
    });
  });

  describe('resetForm', () => {
    it('resets form and resyncs name to store', () => {
      const { result } = renderHook(() => useImageUploadForm('test-image.jpg'));

      vi.clearAllMocks();

      act(() => {
        result.current.resetForm();
      });

      expect(setUploadFileName).toHaveBeenCalledWith('test-image');
    });
  });

  describe('consent metadata sync', () => {
    it('syncs consent metadata to store on initialization', async () => {
      renderHook(() => useImageUploadForm('test.jpg'));

      await waitFor(() => {
        expect(setUploadConsentMetadata).toHaveBeenCalledWith(
          expect.objectContaining({
            dateTaken: null,
            containsPii: false,
            photographerType: 'STAFF',
            photographerName: '',
            consentFormFile: null,
          }),
        );
      });
    });
  });

  describe('conditional field visibility', () => {
    it('showPhotographerFields is false when didYouTakePhoto is null', () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      expect(result.current.showPhotographerFields).toBe(false);
    });

    it('showConsentUpload is false when containsIdentifiableInfo is null', () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      expect(result.current.showConsentUpload).toBe(false);
    });
  });

  describe('consent file handling', () => {
    it('handles consent file selection', async () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));
      const mockFile = new File(['consent'], 'consent.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        result.current.handleConsentFileSelect(mockFile);
      });

      await waitFor(() => {
        expect(result.current.consentFormFile).toBe(mockFile);
      });
    });

    it('handles consent file removal', async () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));
      const mockFile = new File(['consent'], 'consent.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        result.current.handleConsentFileSelect(mockFile);
      });

      await waitFor(() => {
        expect(result.current.consentFormFile).toBe(mockFile);
      });

      act(() => {
        result.current.handleConsentFileRemove();
      });

      await waitFor(() => {
        expect(result.current.consentFormFile).toBeNull();
      });
    });
  });

  describe('form state', () => {
    it('returns isUploadEnabled based on form validity', () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      // Form is initially invalid (required fields not filled)
      expect(result.current.isUploadEnabled).toBe(false);
    });
  });
});
