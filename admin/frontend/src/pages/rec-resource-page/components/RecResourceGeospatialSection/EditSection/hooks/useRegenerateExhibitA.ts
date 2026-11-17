import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useAuthContext } from '@/contexts/AuthContext';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useCreateOrGetExhibitAByApplicationGuid } from '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks';
import {
  addErrorNotification,
  addSpinnerNotification,
  addSuccessNotification,
  removeNotification,
} from '@/store/notificationStore';
import type { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin/models/PendingMapFeatureRequestRowDto';
import type {
  ExhibitAPageOrientation,
  ExhibitAPageSize,
  ExhibitAScale,
} from '../utils/exhibitA';

export interface RegenerateModalState {
  show: boolean;
  row: PendingMapFeatureRequestRowDto | null;
  size: ExhibitAPageSize | '';
  orientation: ExhibitAPageOrientation | '';
  scale: ExhibitAScale | '';
}

export type RegenerateOptionsPatch = Partial<
  Pick<RegenerateModalState, 'size' | 'orientation' | 'scale'>
>;

const INITIAL_STATE: RegenerateModalState = {
  show: false,
  row: null,
  size: '',
  orientation: '',
  scale: '',
};

interface Options {
  onGenerated: (submissionId: string, url: string) => void;
}

export const useRegenerateExhibitA = ({ onGenerated }: Options) => {
  const { isSuperAdmin } = useAuthorizations();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const regenerateMutation = useCreateOrGetExhibitAByApplicationGuid();
  const [state, setState] = useState<RegenerateModalState>(INITIAL_STATE);

  const start = useCallback(
    (row: PendingMapFeatureRequestRowDto) => {
      if (!isSuperAdmin || !row.application_guid || !row.submission_id) return;
      setState({ ...INITIAL_STATE, show: true, row });
    },
    [isSuperAdmin],
  );

  const cancel = useCallback(() => {
    if (regenerateMutation.isPending) return;
    setState((prev) => ({ ...prev, show: false }));
  }, [regenerateMutation.isPending]);

  const updateOptions = useCallback((patch: RegenerateOptionsPatch) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const confirm = useCallback(async () => {
    const { row, size, orientation, scale } = state;
    if (!row || !size || !orientation || !scale) return;
    if (!row.application_guid || !row.submission_id || !isSuperAdmin) return;

    setState((prev) => ({ ...prev, show: false }));

    const notificationId = `regen-exhibit-a-${row.application_guid}`;
    addSpinnerNotification('Generating Exhibit A...', notificationId);

    try {
      const userId =
        user?.idir_username ||
        user?.preferred_username ||
        user?.email ||
        'system';

      const result = await regenerateMutation.mutateAsync({
        applicationGuid: row.application_guid,
        userId,
        generate: true,
        size,
        orientation,
        scale,
      });

      onGenerated(row.submission_id, result.pdfUrl);

      await queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.pendingRequests(),
      });

      addSuccessNotification('Exhibit A regenerated successfully.');
    } catch (error) {
      console.error('Exhibit A regeneration failed:', error);
      addErrorNotification('Failed to regenerate Exhibit A. Please try again.');
    } finally {
      removeNotification(notificationId);
    }
  }, [isSuperAdmin, onGenerated, queryClient, regenerateMutation, state, user]);

  return {
    state,
    isPending: regenerateMutation.isPending,
    start,
    cancel,
    updateOptions,
    confirm,
  } as const;
};
