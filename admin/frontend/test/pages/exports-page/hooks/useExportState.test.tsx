import { useExportState } from '@/pages/exports-page/hooks/useExportState';
import { renderHook, act } from '@testing-library/react';
import { type ChangeEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseGetExportDatasets = vi.fn();
const mockUseGetExportPreview = vi.fn();
const mockDownloadExportCsvRaw = vi.fn();
const mockUseExportFilterOptions = vi.fn();
const mockAddErrorNotification = vi.fn();

vi.mock('@/services', () => ({
  useGetExportDatasets: (...args: unknown[]) =>
    mockUseGetExportDatasets(...args),
  useGetExportPreview: (...args: unknown[]) => mockUseGetExportPreview(...args),
  useRecreationResourceAdminApiClient: () => ({
    downloadExportCsvRaw: mockDownloadExportCsvRaw,
  }),
}));

vi.mock('@/pages/exports-page/hooks/useExportFilterOptions', () => ({
  useExportFilterOptions: () => mockUseExportFilterOptions(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: (...args: unknown[]) =>
    mockAddErrorNotification(...args),
}));

describe('useExportState', () => {
  const toSelectChangeEvent = (value: string): ChangeEvent<HTMLSelectElement> =>
    ({ target: { value } }) as ChangeEvent<HTMLSelectElement>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();

    mockUseGetExportDatasets.mockReturnValue({
      data: {
        datasets: [
          { id: 'file-details', label: 'File details', source: 'RST' },
          {
            id: 'objective-list',
            label: 'Objective list',
            source: 'RST',
            info: 'not-implemented',
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    mockUseGetExportPreview.mockReturnValue({
      data: undefined,
      error: null,
      isFetching: false,
    });

    mockUseExportFilterOptions.mockReturnValue({
      districtOptions: [{ id: 'RDKA', label: 'Kootenay Boundary' }],
      resourceTypeOptions: [{ id: 'SIT', label: 'Recreation site' }],
      isLoading: false,
    });
  });

  it('resets filters on dataset change and disables preview for unavailable datasets', () => {
    const { result } = renderHook(() => useExportState());

    act(() => {
      result.current.filters.handlers.handleDistrictChange(
        toSelectChangeEvent('RDKA'),
      );
      result.current.filters.handlers.handleResourceTypeChange(
        toSelectChangeEvent('SIT'),
      );
    });

    act(() => {
      result.current.filters.handlers.handleDatasetChange(
        toSelectChangeEvent('objective-list'),
      );
    });

    expect(result.current.filters.district).toBe('');
    expect(result.current.filters.resourceType).toBe('');
    expect(result.current.preview.isEnabled).toBe(false);
    expect(result.current.download.isDisabled).toBe(true);
    expect(mockUseGetExportPreview).toHaveBeenLastCalledWith(null);

    act(() => {
      result.current.filters.handlers.handleDatasetChange(
        toSelectChangeEvent('file-details'),
      );
    });

    expect(result.current.preview.isEnabled).toBe(true);
    expect(result.current.download.isDisabled).toBe(false);
    expect(mockUseGetExportPreview).toHaveBeenLastCalledWith({
      dataset: 'file-details',
      district: undefined,
      resourceType: undefined,
      limit: 50,
    });
  });

  it('uses the Content-Disposition filename when downloading', async () => {
    vi.useFakeTimers();

    const blob = new Blob(['csv-data'], { type: 'text/csv' });
    const createObjectUrlSpy = vi.fn().mockReturnValue('blob:test-download');
    const revokeObjectUrlSpy = vi.fn();

    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectUrlSpy,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: revokeObjectUrlSpy,
    });

    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) =>
      tagName === 'a'
        ? anchor
        : originalCreateElement(tagName)) as typeof document.createElement);

    mockDownloadExportCsvRaw.mockResolvedValue({
      value: vi.fn().mockResolvedValue(blob),
      raw: {
        headers: {
          get: vi.fn().mockReturnValue('attachment; filename="exports.csv"'),
        },
      },
    });

    const { result } = renderHook(() => useExportState());

    act(() => {
      result.current.filters.handlers.handleDatasetChange(
        toSelectChangeEvent('file-details'),
      );
    });

    await act(async () => {
      await result.current.download.handleDownload();
    });

    expect(mockDownloadExportCsvRaw).toHaveBeenCalledWith({
      dataset: 'file-details',
      district: undefined,
      resourceType: undefined,
    });
    expect(anchor.download).toBe('exports.csv');
    expect(anchor.href).toBe('blob:test-download');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(createObjectUrlSpy).toHaveBeenCalledWith(blob);

    vi.runAllTimers();

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:test-download');
  });

  it('falls back to the dataset id when the response has no filename header', async () => {
    const blob = new Blob(['csv-data'], { type: 'text/csv' });
    const createObjectUrlSpy = vi.fn().mockReturnValue('blob:test-fallback');

    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectUrlSpy,
    });

    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    vi.spyOn(anchor, 'click').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
    ) =>
      tagName === 'a'
        ? anchor
        : originalCreateElement(tagName)) as typeof document.createElement);

    mockDownloadExportCsvRaw.mockResolvedValue({
      value: vi.fn().mockResolvedValue(blob),
      raw: {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    });

    const { result } = renderHook(() => useExportState());

    act(() => {
      result.current.filters.handlers.handleDatasetChange(
        toSelectChangeEvent('file-details'),
      );
    });

    await act(async () => {
      await result.current.download.handleDownload();
    });

    expect(anchor.download).toBe('file-details.csv');
    expect(createObjectUrlSpy).toHaveBeenCalledWith(blob);
  });
});
