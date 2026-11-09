import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

vi.mock('@shared/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/utils')>()),
  downloadUrlAsFile: vi.fn(),
}));
vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: vi.fn(),
  addErrorNotification: vi.fn(),
  addSpinnerNotification: vi.fn(),
  removeNotification: vi.fn(),
}));

import { useFileDownload } from '@/pages/rec-resource-page/hooks/useFileDownload';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import * as notificationStore from '@/store/notificationStore';
import * as fileUtils from '@shared/utils';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    );
  };
};

const getMutation = () => {
  const { result } = renderHook(() => useFileDownload(), {
    wrapper: createWrapper(),
  });
  return result.current;
};

describe('useDownloadFileMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls downloadUrlAsFile and shows success notification on success', async () => {
    (fileUtils.downloadUrlAsFile as any).mockResolvedValueOnce(undefined);
    const mutation = getMutation();
    const file: GalleryFile = {
      id: '1',
      name: 'file.pdf',
      url: 'test-url',
      date: '2025-07-15',
      extension: 'pdf',
      type: 'document',
    };
    await act(async () => {
      await mutation.mutateAsync({ file, recResourceId: 'REC1234' });
    });
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      'test-url',
      'docs.sitesandtrailsbc.REC1234.file.pdf',
    );
    expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
      'File "file.pdf" downloaded successfully.',
    );
    expect(notificationStore.addErrorNotification).not.toHaveBeenCalled();
  });

  it('shows error notification on failure', async () => {
    (fileUtils.downloadUrlAsFile as any).mockRejectedValueOnce(
      new Error('fail'),
    );
    const mutation = getMutation();
    const file = {
      id: '2',
      name: 'bad.pdf',
      url: 'bad-url',
      date: '2025-07-15',
      extension: 'pdf',
      type: 'document' as const,
    };
    await act(async () => {
      await expect(mutation.mutateAsync({ file })).rejects.toThrow();
    });
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      'bad-url',
      'docs.sitesandtrailsbc.bad.pdf',
    );
    expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
      'Failed to download file "bad.pdf".',
    );
    expect(notificationStore.addSuccessNotification).not.toHaveBeenCalled();
  });

  it('names images with the images prefix and the doc type', async () => {
    (fileUtils.downloadUrlAsFile as any).mockResolvedValueOnce(undefined);
    const mutation = getMutation();
    const file: GalleryFile = {
      id: '3',
      name: 'Lake View',
      url: 'img-url',
      date: '2025-07-15',
      extension: 'webp',
      type: 'image',
    };
    await act(async () => {
      await mutation.mutateAsync({ file, recResourceId: 'REC1234' });
    });
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      'img-url',
      'images.sitesandtrailsbc.REC1234.lake-view.webp',
    );
  });

  it('adds the doc type between the rec id and the name', async () => {
    (fileUtils.downloadUrlAsFile as any).mockResolvedValueOnce(undefined);
    const mutation = getMutation();
    const file: GalleryFile = {
      id: '4',
      name: 'Survey plan',
      url: 'doc-url',
      date: '2025-07-15',
      extension: 'pdf',
      type: 'document',
    };
    await act(async () => {
      await mutation.mutateAsync({
        file,
        recResourceId: 'REC1234',
        docType: 'exhibit-a',
      });
    });
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      'doc-url',
      'docs.sitesandtrailsbc.REC1234.exhibit-a.survey-plan.pdf',
    );
  });
});
