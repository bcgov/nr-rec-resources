import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useAuthContext } from '@/contexts/AuthContext';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useUpdateRecreationResource } from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResource';
import { useUpdateRecreationResourceMapFeatures } from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceMapFeatures';
import {
  addErrorNotification,
  addSpinnerNotification,
  addSuccessNotification,
  removeNotification,
} from '@/store/notificationStore';

const RESTORE_NOTIFICATION_ID = 'unarchive-resource';
const RESUBMIT_THRESHOLD_HOURS = 24;

interface UnarchiveResource {
  rec_resource_type_code?: string | null;
  updated_at?: string | Date | null;
}

interface Options {
  recResourceId: string;
  recResource?: UnarchiveResource | null;
  isArchived: boolean;
  spatialFeatureGeometry?: ReadonlyArray<unknown> | null;
  sectionIds?: ReadonlyArray<string | null | undefined> | null;
}

export const useUnarchiveFlow = ({
  recResourceId,
  recResource,
  isArchived,
  spatialFeatureGeometry,
  sectionIds,
}: Options) => {
  const { isSuperAdmin } = useAuthorizations();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { mutateAsync: updateResource } = useUpdateRecreationResource();
  const { mutateAsync: updateMapFeatures } =
    useUpdateRecreationResourceMapFeatures();

  const [showOptions, setShowOptions] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [currentTimeMs] = useState(() => Date.now());

  const updatedAt = recResource?.updated_at ?? null;

  // NOTE: updated_at changes on any edit. Prefer an archived_at field if the
  // API exposes one.
  const archiveAgeHours =
    updatedAt != null && currentTimeMs > 0
      ? (currentTimeMs - new Date(updatedAt).getTime()) / 3_600_000
      : null;

  const archivedAt =
    updatedAt != null ? new Date(updatedAt).toISOString() : null;

  const isArchivedOlderThan24Hours =
    archiveAgeHours != null && archiveAgeHours >= RESUBMIT_THRESHOLD_HOURS;

  const existingFeatures = useMemo(() => {
    const features: Array<{
      geometry: Record<string, unknown>;
      sectionId?: string;
      properties: Record<string, unknown>;
    }> = [];

    (spatialFeatureGeometry ?? []).forEach((featureGeometry, index) => {
      if (typeof featureGeometry !== 'string' || !featureGeometry.trim()) {
        return;
      }
      try {
        features.push({
          geometry: JSON.parse(featureGeometry) as Record<string, unknown>,
          sectionId: sectionIds?.[index] || undefined,
          properties: {},
        });
      } catch (error) {
        console.error(
          'Failed to parse stored spatial feature geometry:',
          error,
        );
      }
    });

    return features;
  }, [sectionIds, spatialFeatureGeometry]);

  const previewFeatures = useMemo(
    () =>
      existingFeatures.map((feature) => ({
        type: 'Feature' as const,
        geometry: feature.geometry,
        properties: feature.properties ?? {},
      })),
    [existingFeatures],
  );

  const openOptions = useCallback(() => {
    if (!isSuperAdmin || !recResourceId || !recResource || !isArchived) return;
    setShowOptions(true);
  }, [isArchived, isSuperAdmin, recResource, recResourceId]);

  const closeOptions = useCallback(() => setShowOptions(false), []);

  const restoreWithExistingData = useCallback(async () => {
    if (!recResourceId || !recResource) return;

    // Keep the panel open (busy) until the restore succeeds.
    setIsRestoring(true);
    addSpinnerNotification(
      'Restoring archived resource...',
      RESTORE_NOTIFICATION_ID,
    );

    try {
      if (isArchivedOlderThan24Hours) {
        if (!existingFeatures.length) {
          addErrorNotification(
            'No existing spatial data is available to resubmit to SNCSC.',
          );
          return;
        }

        await updateMapFeatures({
          recResourceId,
          newFeatures: [],
          amendedFeatures: existingFeatures,
          retiredFeatures: [],
          recreationTypeCode: recResource.rec_resource_type_code || undefined,
          submittedBy:
            user?.email ||
            user?.preferred_username ||
            user?.idir_username ||
            undefined,
        });
      }

      await updateResource({
        recResourceId,
        updateRecreationResourceDto: { rec_status_code: 'HI' } as any,
      });

      setShowOptions(false);

      addSuccessNotification(
        isArchivedOlderThan24Hours
          ? 'Existing spatial data submitted for amendment and the resource has been restored.'
          : 'Resource restored from Archived to Issued.',
      );

      await queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.pendingRequests(),
      });
    } catch (error) {
      console.error('Failed to restore archived resource:', error);
      addErrorNotification(
        isArchivedOlderThan24Hours
          ? 'Failed to submit the existing spatial data. Please try again.'
          : 'Failed to restore the resource. Please try again.',
      );
    } finally {
      removeNotification(RESTORE_NOTIFICATION_ID);
      setIsRestoring(false);
    }
  }, [
    existingFeatures,
    isArchivedOlderThan24Hours,
    queryClient,
    recResource,
    recResourceId,
    updateMapFeatures,
    updateResource,
    user,
  ]);

  return {
    showOptions,
    isRestoring,
    archiveAgeHours,
    archivedAt,
    previewFeatures,
    openOptions,
    closeOptions,
    restoreWithExistingData,
  } as const;
};
