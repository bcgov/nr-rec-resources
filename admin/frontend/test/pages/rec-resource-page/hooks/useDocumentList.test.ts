import { useDocumentList } from '@/pages/rec-resource-page/hooks/useDocumentList';
import { renderHook } from '@testing-library/react';

const mockUseGetDocumentsByRecResourceId = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId',
  () => ({
    useGetDocumentsByRecResourceId: (...args: any[]) =>
      mockUseGetDocumentsByRecResourceId(...args),
  }),
);
vi.mock('@/pages/rec-resource-page/helpers', () => ({
  formatGalleryFileDate: (date: string) => `formatted-${date}`,
}));

const baseDoc = {
  document_id: '1',
  file_name: 'Doc 1',
  created_at: '2024-01-01',
  url: 'url1',
  extension: 'pdf',
  doc_code: 'A',
  doc_code_description: 'desc',
  rec_resource_id: 'abc',
};

describe('useDocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped documents and correct state', () => {
    mockUseGetDocumentsByRecResourceId.mockReturnValue({
      data: [baseDoc],
      isFetching: false,
      refetch: vi.fn(),
    });
    const { result } = renderHook(() => useDocumentList('abc'));
    expect(result.current.galleryDocumentsFromServer[0]).toMatchObject({
      id: '1',
      name: 'Doc 1',
      date: 'formatted-2024-01-01',
      url: 'url1',
      extension: 'pdf',
      doc_code: 'A',
      doc_code_description: 'desc',
      rec_resource_id: 'abc',
    });
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('returns empty array if no documents', () => {
    mockUseGetDocumentsByRecResourceId.mockReturnValue({
      data: [],
      isFetching: false,
      refetch: vi.fn(),
    });
    const { result } = renderHook(() => useDocumentList('abc'));
    expect(result.current.galleryDocumentsFromServer).toEqual([]);
  });

  it('handles many documents', () => {
    const docs = Array.from({ length: 30 }, (_, i) => ({
      ...baseDoc,
      document_id: String(i),
    }));
    mockUseGetDocumentsByRecResourceId.mockReturnValue({
      data: docs,
      isFetching: false,
      refetch: vi.fn(),
    });
    const { result } = renderHook(() => useDocumentList('abc'));
    expect(result.current.galleryDocumentsFromServer).toHaveLength(30);
  });
});
