import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { formatUploadError } from '@/pages/rec-resource-page/hooks/utils/fileErrorMessages';
import { validateUploadFile } from '@/pages/rec-resource-page/hooks/utils/validateUpload';
import {
  FileType,
  GalleryDocument,
  GalleryImage,
} from '@/pages/rec-resource-page/types';
import { RecreationResourceDetailDto } from '@/services/recreation-resource-admin';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { vi } from 'vitest';

export interface MockRecResourceOptions {
  rec_resource_id?: string;
  name?: string;
  [key: string]: any;
}

export interface MockGalleryFileOptions {
  id?: string;
  name?: string;
  date?: string;
  url?: string;
  extension?: string;
  type?: FileType;
  pendingFile?: File;
  variants?: any[];
  previewUrl?: string;
  [key: string]: any;
}

export function createMockRecResource(
  options: MockRecResourceOptions = {},
): RecreationResourceDetailDto {
  return {
    rec_resource_id: options.rec_resource_id || 'test-resource-id',
    name: options.name || 'Test Resource',
    ...options,
  } as RecreationResourceDetailDto;
}

export function createMockFile(
  name: string = 'test-file',
  type: string = 'application/pdf',
  content: string = 'content',
): File {
  return new File([content], name, { type });
}

export function createMockGalleryFile<T extends GalleryImage | GalleryDocument>(
  type: FileType,
  options: MockGalleryFileOptions = {},
): T {
  const baseFile = {
    id: options.id || 'temp-id',
    name: options.name || 'Test File',
    date: options.date || '2024-01-01',
    url: options.url || '',
    extension: options.extension || (type === 'image' ? 'jpg' : 'pdf'),
    type,
    pendingFile: options.pendingFile,
    ...options,
  };

  if (type === 'image') {
    return {
      ...baseFile,
      variants: options.variants || [],
      previewUrl: options.previewUrl || '',
    } as T;
  }

  return baseFile as T;
}

export function createMockImageVariants() {
  return [
    {
      sizeCode: 'original' as const,
      blob: new Blob(['original'], { type: 'image/webp' }),
      width: 1920,
      height: 1080,
      file: new File(['original'], 'original.webp', { type: 'image/webp' }),
    },
    {
      sizeCode: 'scr' as const,
      blob: new Blob(['scr'], { type: 'image/webp' }),
      width: 1400,
      height: 800,
      file: new File(['scr'], 'scr.webp', { type: 'image/webp' }),
    },
    {
      sizeCode: 'pre' as const,
      blob: new Blob(['pre'], { type: 'image/webp' }),
      width: 900,
      height: 540,
      file: new File(['pre'], 'pre.webp', { type: 'image/webp' }),
    },
    {
      sizeCode: 'thm' as const,
      blob: new Blob(['thm'], { type: 'image/webp' }),
      width: 250,
      height: 250,
      file: new File(['thm'], 'thm.webp', { type: 'image/webp' }),
    },
  ];
}

export function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

export interface SetupUploadMocksOptions {
  recResourceId?: string | null | undefined;
  validateUploadFileReturn?: boolean;
  formatUploadErrorImpl?: (
    fileLabel: string,
    errorInfo: { statusCode: number; message: string },
    isProcessingError: boolean,
  ) => string;
  handleApiErrorReturn?: {
    statusCode: number;
    message: string;
    isResponseError?: boolean;
    isAuthError?: boolean;
  };
}

export function setupUploadMocks(options: SetupUploadMocksOptions = {}) {
  const recResourceId =
    'recResourceId' in options ? options.recResourceId : 'test-resource-id';
  const validateUploadFileReturn = options.validateUploadFileReturn ?? true;
  const formatUploadErrorImpl = options.formatUploadErrorImpl;
  const handleApiErrorReturn = options.handleApiErrorReturn;

  const mockRecResource =
    recResourceId !== undefined && recResourceId !== null
      ? createMockRecResource({
          rec_resource_id: recResourceId,
        })
      : null;

  vi.mocked(useRecResource).mockReturnValue({
    rec_resource_id: recResourceId || undefined,
    recResource: mockRecResource,
    isLoading: false,
    error: null,
  });

  const mockValidateUploadFile = vi.mocked(validateUploadFile);
  mockValidateUploadFile.mockReturnValue(validateUploadFileReturn);

  const mockFormatUploadError = vi.mocked(formatUploadError);
  if (formatUploadErrorImpl) {
    mockFormatUploadError.mockImplementation(formatUploadErrorImpl);
  } else {
    mockFormatUploadError.mockImplementation(
      (fileLabel, errorInfo) =>
        `${errorInfo.statusCode} - Failed to upload ${fileLabel}: ${errorInfo.message}. Please try again.`,
    );
  }

  const mockHandleApiError = vi.mocked(handleApiError);
  if (handleApiErrorReturn) {
    mockHandleApiError.mockResolvedValue(handleApiErrorReturn);
  } else {
    mockHandleApiError.mockResolvedValue({
      statusCode: 500,
      message: 'Error message',
      isResponseError: false,
      isAuthError: false,
    });
  }

  vi.mocked(addSuccessNotification).mockImplementation(() => {});
  vi.mocked(addErrorNotification).mockImplementation(() => {});

  return {
    mockRecResource,
    mockValidateUploadFile,
    mockFormatUploadError,
    mockHandleApiError,
  };
}

export interface SetupDeleteMocksOptions {
  recResourceId?: string | null | undefined;
  recResource?: RecreationResourceDetailDto | null;
}

export function setupDeleteMocks(options: SetupDeleteMocksOptions = {}) {
  const recResourceId =
    'recResourceId' in options ? options.recResourceId : 'test-resource-id';
  const recResource = options.recResource;

  const mockRecResourceValue =
    recResource !== undefined
      ? recResource
      : recResourceId !== undefined && recResourceId !== null
        ? createMockRecResource({ rec_resource_id: recResourceId })
        : null;

  vi.mocked(useRecResource).mockReturnValue({
    rec_resource_id: recResourceId || undefined,
    recResource: mockRecResourceValue,
    isLoading: false,
    error: null,
  });

  return {
    mockRecResource: mockRecResourceValue,
  };
}

export function setupRecResourceMock(
  recResourceId: string | null | undefined = 'test-resource-id',
  recResource: RecreationResourceDetailDto | null | undefined = null,
) {
  const mockRecResourceValue =
    recResource ||
    (recResourceId
      ? createMockRecResource({ rec_resource_id: recResourceId })
      : null);

  vi.mocked(useRecResource).mockReturnValue({
    rec_resource_id: recResourceId || undefined,
    recResource: mockRecResourceValue,
    isLoading: false,
    error: null,
  });

  return mockRecResourceValue;
}
