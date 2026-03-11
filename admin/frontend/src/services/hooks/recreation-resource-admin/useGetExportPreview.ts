import {
  GetExportPreviewDatasetEnum,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface ExportPreviewRequest {
  dataset: string;
  district?: string;
  resourceType?: string;
  limit?: number;
}

export interface ExportPreviewResponse {
  columns: string[];
  rows: Array<Record<string, string | null>>;
}

export function useGetExportPreview(request: ExportPreviewRequest | null) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.exportPreview(request),
    enabled: Boolean(request?.dataset),
    queryFn: async () => {
      if (!request?.dataset) {
        throw new Error('A dataset is required to load an export preview.');
      }

      const response = await api.getExportPreview({
        dataset: request.dataset as GetExportPreviewDatasetEnum,
        district: request.district,
        resourceType: request.resourceType,
        limit: request.limit,
      });

      return {
        columns: response.columns,
        rows: response.rows,
      } satisfies ExportPreviewResponse;
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load the export preview after multiple attempts. Please try again later.',
          'getExportPreview-error',
        ),
    }),
  }) as ReturnType<typeof useQuery<ExportPreviewResponse, ResponseError>>;
}
