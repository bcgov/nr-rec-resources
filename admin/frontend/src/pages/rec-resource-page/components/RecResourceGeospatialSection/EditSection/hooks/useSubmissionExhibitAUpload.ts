import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import type { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin/models/PendingMapFeatureRequestRowDto';
import { useExhibitAFileUpload } from './useExhibitAFileUpload';
import { useExhibitAUploadModal } from './useExhibitAUploadModal';

interface Options {
  recResourceId: string;
  onUploaded: (applicationGuid: string, url: string) => void;
}

/** Upload an Exhibit A PDF for one row of the submissions table. */
export const useSubmissionExhibitAUpload = ({
  recResourceId,
  onUploaded,
}: Options) => {
  const { isSuperAdmin } = useAuthorizations();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRow, setSelectedRow] =
    useState<PendingMapFeatureRequestRowDto | null>(null);

  const modal = useExhibitAUploadModal();
  const { selectFile, hide } = modal;
  const { upload, isPending } = useExhibitAFileUpload(recResourceId);

  const startUpload = useCallback(
    (row: PendingMapFeatureRequestRowDto) => {
      if (!isSuperAdmin || !row.submission_id) return;
      setSelectedRow(row);
      fileInputRef.current?.click();
    },
    [isSuperAdmin],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !selectedRow?.submission_id) return;
      selectFile(file);
    },
    [selectFile, selectedRow],
  );

  const confirmUpload = useCallback(async () => {
    const { file, fileName } = modal.state;
    if (
      !selectedRow?.submission_id ||
      !selectedRow?.application_guid ||
      !file?.pendingFile ||
      !fileName
    ) {
      return;
    }
    const submissionId = selectedRow.submission_id;

    hide();

    try {
      const finalized = await upload({
        file: file.pendingFile,
        fileName,
        extension: file.extension,
        applicationGuid: selectedRow.application_guid,
        submissionId,
      });

      onUploaded(selectedRow.application_guid, finalized.url);

      await queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.pendingRequests(),
      });

      addSuccessNotification('Exhibit A uploaded successfully.');
    } catch (error) {
      console.error('Exhibit A upload failed:', error);
      addErrorNotification('Failed to upload Exhibit A. Please try again.');
    }
  }, [hide, modal.state, onUploaded, queryClient, selectedRow, upload]);

  return {
    fileInputRef,
    modalState: modal.state,
    setModalFileName: modal.setFileName,
    hideModal: modal.hide,
    isUploading: isPending,
    startUpload,
    handleFileInputChange,
    confirmUpload,
  } as const;
};
