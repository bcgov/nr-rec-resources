import { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Spinner, Stack } from 'react-bootstrap';
import { EditableGuard } from '@/components/auth';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { Route } from '@/routes/rec-resource/$id/geospatial';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';
import { useGetMapFeatureRequestsByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetMapFeatureRequestsByRecResourceId';
import { useGetExhibitADocs } from '@/services/hooks/recreation-resource-admin/useGetExhibitADocs';
import { IMAP_URL } from '@/constants/urls';
import { buildImapUrlFromLatLng, buildImapUrlFromUtm } from '@/utils/imap';
import { SpatialSubmissionSection } from '@/components/RecResourceSpatial/SpatialSubmissionSection';
import { DocumentUploadModal } from '@/components/file/DocumentUploadModal';

import './RecResourceGeospatialSection.scss';
import { useRegenerateExhibitA } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useRegenerateExhibitA';
import { useAdjudicationReport } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useAdjudicationReport';
import { useUnarchiveFlow } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useUnarchiveFlow';
import { useSubmissionExhibitAUpload } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useSubmissionExhibitAUpload';
import { GeospatialFieldsCard } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/GeospatialFieldsCard';
import { SpatialSubmissionsTable } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/SpatialSubmissionsTable';
import { UnarchiveOptionsPanel } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/UnarchiveOptionsPanel';
import { RegenerateExhibitAModal } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/RegenerateExhibitAModal';

export function RecResourceGeospatialSection() {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';

  const [isSpatialSubmissionOpen, setIsSpatialSubmissionOpen] = useState(false);
  // Keyed by submission_id, falling back to application_guid.
  const [exhibitAUrlBySubmission, setExhibitAUrlBySubmission] = useState<
    Record<string, string>
  >({});

  const { data: geospatialData } =
    useGetRecreationResourceGeospatial(recResourceId);
  const {
    data: mapFeatureRequests,
    isLoading: isRequestsLoading,
    isFetching: isRequestsFetching,
  } = useGetMapFeatureRequestsByRecResourceId(recResourceId);
  const { data: exhibitADocs = [] } = useGetExhibitADocs(recResourceId);

  const handleExhibitAUrl = useCallback((key: string, url: string) => {
    setExhibitAUrlBySubmission((prev) => ({ ...prev, [key]: url }));
  }, []);

  const unarchive = useUnarchiveFlow({
    recResourceId,
    recResource,
    isArchived,
    spatialFeatureGeometry:
      geospatialData?.spatial_feature_geometry ??
      recResource?.spatial_feature_geometry,
    sectionIds: geospatialData?.section_ids,
  });
  const upload = useSubmissionExhibitAUpload({
    recResourceId,
    onUploaded: handleExhibitAUrl,
  });
  const regenerate = useRegenerateExhibitA({ onGenerated: handleExhibitAUrl });
  const { viewAdjudicationReport } = useAdjudicationReport();

  const recResourceWithGeometry = useMemo(
    () =>
      recResource
        ? {
          ...recResource,
          site_point_geometry:
            geospatialData?.site_point_geometry ??
            recResource.site_point_geometry,
          spatial_feature_geometry:
            geospatialData?.spatial_feature_geometry ??
            recResource.spatial_feature_geometry,
        }
        : undefined,
    [
      geospatialData?.site_point_geometry,
      geospatialData?.spatial_feature_geometry,
      recResource,
    ],
  );

  const { latitude, longitude, utm_zone, utm_easting, utm_northing } =
  geospatialData || {};
  const imapUrl =
    latitude != null && longitude != null
      ? buildImapUrlFromLatLng(latitude, longitude)
      : utm_zone != null && utm_easting != null && utm_northing != null
        ? buildImapUrlFromUtm(utm_easting, utm_northing, utm_zone)
        : IMAP_URL;

  const submissionRows = useMemo(
    () =>
      [...(mapFeatureRequests?.data ?? [])].sort((a, b) => {
        const aTime = a.requested_at ? Date.parse(a.requested_at) : 0;
        const bTime = b.requested_at ? Date.parse(b.requested_at) : 0;
        return bTime - aTime;
      }),
    [mapFeatureRequests?.data],
  );
  const isRequestsBusy = isRequestsLoading || isRequestsFetching;

  const handleStartUnarchive = () => {
    setIsSpatialSubmissionOpen(false);
    unarchive.openOptions();
  };

  return (
    <Stack className="geospatial-section" direction="vertical" gap={4}>
      <GeospatialFieldsCard
        recResourceId={recResourceId}
        resourceTypeCode={recResource?.rec_resource_type_code}
        isArchived={isArchived}
        geospatialData={geospatialData}
      />

      {recResourceWithGeometry && (
        <div className="geospatial-section__card">
          <div className="geospatial-section__card-header">
            <h2 className="geospatial-section__card-title">Location map</h2>
          </div>
          <div className="geospatial-section__card-body">
            <RecResourceLocationSection
              recResource={recResourceWithGeometry}
              showHeading={false}
              imapUrl={imapUrl}
            />
          </div>
        </div>
      )}

      <div className="geospatial-section__card">
        <div className="geospatial-section__card-header">
          <h2 className="geospatial-section__card-title">
            Spatial submissions
          </h2>
        </div>
        <div className="geospatial-section__card-body">
          {isRequestsBusy ? (
            <Alert
              variant="light"
              className="mb-0 d-flex align-items-center gap-2"
            >
              <Spinner animation="border" size="sm" aria-hidden="true" />
              <span>Loading spatial submissions...</span>
            </Alert>
          ) : submissionRows.length === 0 ? (
            <p className="text-muted mb-0">No spatial submissions yet.</p>
          ) : (
            <SpatialSubmissionsTable
              rows={submissionRows}
              exhibitADocs={exhibitADocs}
              exhibitAUrlOverrides={exhibitAUrlBySubmission}
              isUploading={upload.isUploading}
              isRegenerating={regenerate.isPending}
              onViewAdjudicationReport={viewAdjudicationReport}
              onUpload={upload.startUpload}
              onRegenerate={regenerate.start}
            />
          )}

          <EditableGuard isArchived={isArchived}>
            {!isSpatialSubmissionOpen && !unarchive.showOptions ? (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={
                    isArchived
                      ? handleStartUnarchive
                      : () => setIsSpatialSubmissionOpen(true)
                  }
                  disabled={isRequestsBusy}
                >
                  {isArchived ? 'Unarchive' : 'Create new'}
                </Button>
              </div>
            ) : null}
          </EditableGuard>

          {unarchive.showOptions ? (
            <UnarchiveOptionsPanel
              features={unarchive.previewFeatures}
              resourceTypeCode={recResource?.rec_resource_type_code}
              archivedAt={unarchive.archivedAt}
              archiveAgeHours={unarchive.archiveAgeHours}
              totalAreaHectares={geospatialData?.total_area_hectares}
              totalLengthKm={geospatialData?.total_length_km}
              isBusy={unarchive.isRestoring}
              onReuse={() => {
                void unarchive.restoreWithExistingData();
              }}
              onUploadNew={() => {
                unarchive.closeOptions();
                setIsSpatialSubmissionOpen(true);
              }}
              onCancel={unarchive.closeOptions}
            />
          ) : null}

          {isSpatialSubmissionOpen ? (
            <div className="mt-4 pt-3 border-top">
              <SpatialSubmissionSection
                recResourceId={recResourceId}
                defaultRecreationTypeCode={recResource?.rec_resource_type_code}
                defaultNaturalResourceDistrict={
                  recResource?.natural_resource_org_unit_name || undefined
                }
                defaultRecreationDistrict={
                  recResource?.recreation_district?.district_code
                }
                editMode={true}
                useGeospatialCompactForm={true}
                existingSectionIds={geospatialData?.section_ids ?? undefined}
                showCreateHeading={true}
                onCancel={() => setIsSpatialSubmissionOpen(false)}
              />
            </div>
          ) : null}

          <input
            ref={upload.fileInputRef}
            type="file"
            accept="application/pdf"
            className="d-none"
            onChange={upload.handleFileInputChange}
            aria-label="Upload Exhibit A document"
          />

          <DocumentUploadModal
            show={upload.modal.state.show}
            file={upload.modal.state.file}
            fileName={upload.modal.state.fileName}
            showAlert={false}
            fileNameError={upload.modal.state.fileNameError}
            onFileNameChange={upload.modal.setFileName}
            onCancel={upload.modal.hide}
            onConfirm={upload.confirmUpload}
            title="Upload Exhibit A document"
          />

          <RegenerateExhibitAModal
            state={regenerate.state}
            isPending={regenerate.isPending}
            onChange={regenerate.updateOptions}
            onCancel={regenerate.cancel}
            onConfirm={() => {
              void regenerate.confirm();
            }}
          />
        </div>
      </div>
    </Stack>
  );
}