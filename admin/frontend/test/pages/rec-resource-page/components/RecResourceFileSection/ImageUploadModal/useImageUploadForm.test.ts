import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks/useImageUploadForm';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
}));

describe('useImageUploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with display name without extension and syncs to store', () => {
    const initialName = 'test-image.jpg';
    renderHook(() => useImageUploadForm(initialName));

    expect(setUploadFileName).toHaveBeenCalledWith('test-image');
  });

  it('resets form and resyncs name to store', () => {
    const initialName = 'test-image.jpg';
    const { result } = renderHook(() => useImageUploadForm(initialName));

    vi.clearAllMocks();

    act(() => {
      result.current.resetForm();
    });

    expect(setUploadFileName).toHaveBeenCalledWith('test-image');
  });

  it('handles undefined initialDisplayName and syncs empty string to store', () => {
    renderHook(() => useImageUploadForm(undefined));

    expect(setUploadFileName).toHaveBeenCalledWith('');
  });

  it('resets form to empty string when initialDisplayName is undefined', () => {
    const { result } = renderHook(() => useImageUploadForm(undefined));

    vi.clearAllMocks();

    act(() => {
      result.current.resetForm();
    });

    expect(setUploadFileName).toHaveBeenCalledWith('');
  });

  it('updates uploadState correctly based on form values', () => {
    const { result } = renderHook(() => useImageUploadForm('test.jpg'));

    expect(result.current.uploadState).toBe('initial');
    expect(result.current.isUploadEnabled).toBe(false);
  });
});
