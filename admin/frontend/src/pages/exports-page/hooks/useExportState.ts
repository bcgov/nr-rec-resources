import {
  useGetExportDatasets,
  useGetExportPreview,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { DownloadExportCsvDatasetEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { addErrorNotification } from '@/store/notificationStore';
import { useMemo, useState } from 'react';
import { NOT_IMPLEMENTED_INFO } from '../constants';
import { useExportFilterOptions } from './useExportFilterOptions';

const isDatasetUnavailable = (info?: string) => info === NOT_IMPLEMENTED_INFO;

const getDownloadFileName = (
  contentDisposition: string | null,
  fallbackDataset: string,
) => {
  if (!contentDisposition) {
    return `${fallbackDataset}.csv`;
  }

  const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  if (fileNameMatch?.[1]) {
    return fileNameMatch[1];
  }

  return `${fallbackDataset}.csv`;
};

export const useExportState = () => {
  const api = useRecreationResourceAdminApiClient();
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: datasetsResponse,
    isLoading: isLoadingDatasets,
    error: datasetsError,
  } = useGetExportDatasets();

  const {
    districtOptions,
    resourceTypeOptions,
    isLoading: isLoadingFilters,
  } = useExportFilterOptions();

  const datasets = useMemo(
    () => datasetsResponse?.datasets ?? [],
    [datasetsResponse?.datasets],
  );

  const groupedDatasets = useMemo(
    () =>
      [
        {
          source: 'FTA',
          datasets: datasets.filter((dataset) => dataset.source === 'FTA'),
        },
        {
          source: 'RST',
          datasets: datasets.filter((dataset) => dataset.source === 'RST'),
        },
      ].filter((group) => group.datasets.length > 0),
    [datasets],
  );

  const selectedDatasetDefinition = datasets.find(
    (dataset) => dataset.id === selectedDataset,
  );

  const previewRequest =
    selectedDatasetDefinition &&
    !isDatasetUnavailable(selectedDatasetDefinition.info) &&
    selectedDataset
      ? {
          dataset: selectedDataset,
          district: selectedDistrict || undefined,
          resourceType: selectedResourceType || undefined,
          limit: 50,
        }
      : null;

  const {
    data: previewResponse,
    error: previewError,
    isFetching: isLoadingPreview,
  } = useGetExportPreview(previewRequest);

  const handleSelectDataset = (datasetId: string) => {
    setSelectedDataset(datasetId);
    setSelectedDistrict('');
    setSelectedResourceType('');
  };

  const handleDownload = async () => {
    if (!selectedDataset || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const response = await api.downloadExportCsvRaw({
        dataset: selectedDataset as DownloadExportCsvDatasetEnum,
        district: selectedDistrict || undefined,
        resourceType: selectedResourceType || undefined,
      });
      const blob = await response.value();
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = getDownloadFileName(
        response.raw.headers.get('content-disposition'),
        selectedDataset,
      );
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch {
      addErrorNotification(
        'Failed to download the CSV export. Please try again.',
        'downloadExportCsv-error',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    datasets: {
      grouped: groupedDatasets,
      selected: selectedDatasetDefinition,
      isLoading: isLoadingDatasets,
      error: datasetsError,
    },
    filters: {
      district: selectedDistrict,
      resourceType: selectedResourceType,
      options: { districtOptions, resourceTypeOptions },
      isLoading: isLoadingFilters,
      handlers: {
        handleSelectDataset,
        setSelectedDistrict,
        setSelectedResourceType,
      },
    },
    preview: {
      data: previewResponse,
      isLoading: isLoadingPreview,
      error: previewError,
      isEnabled: Boolean(previewRequest),
    },
    download: {
      isDownloading,
      handleDownload,
      isDisabled:
        !selectedDataset ||
        !selectedDatasetDefinition ||
        isDatasetUnavailable(selectedDatasetDefinition.info) ||
        isDownloading,
    },
  };
};
