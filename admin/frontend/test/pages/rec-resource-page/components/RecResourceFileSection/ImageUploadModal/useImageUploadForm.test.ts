import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks/useImageUploadForm';
import {
  setUploadFileName,
  setUploadConsentData,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
  setUploadConsentData: vi.fn(),
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
        expect(setUploadConsentData).toHaveBeenCalledWith(
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

  describe('staff field visibility (default)', () => {
    it('shows "working hours" question for staff', () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      expect(result.current.showTakenDuringWorkingHours).toBe(true);
    });

    it('hides name field for staff', () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      expect(result.current.showNameField).toBe(false);
    });

    it('hides consent upload by default for staff (before questions answered)', () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      expect(result.current.showConsentUpload).toBe(false);
    });
  });

  describe('staff consent upload visibility', () => {
    it('shows consent upload when staff photo NOT taken during working hours', async () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      act(() => {
        result.current.setValue('didYouTakePhoto', false);
      });

      await waitFor(() => {
        expect(result.current.showConsentUpload).toBe(true);
      });
    });

    it('shows consent upload when staff photo contains PII', async () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      act(() => {
        result.current.setValue('didYouTakePhoto', true);
        result.current.setValue('containsIdentifiableInfo', true);
      });

      await waitFor(() => {
        expect(result.current.showConsentUpload).toBe(true);
      });
    });

    it('hides consent upload when staff: working hours + no PII', async () => {
      const { result } = renderHook(() => useImageUploadForm('test.jpg'));

      act(() => {
        result.current.setValue('didYouTakePhoto', true);
        result.current.setValue('containsIdentifiableInfo', false);
      });

      await waitFor(() => {
        expect(result.current.showConsentUpload).toBe(false);
      });
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
