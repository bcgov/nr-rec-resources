import { useCallback, useRef, useState } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import {
  faArrowUpFromBracket,
  faArrowUpRightFromSquare,
  faDownload,
  faEye,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EditableGuard } from '@/components/auth';
import { Table as DataTable } from '@/components';
import { CustomBadge } from '@/components/custom-badge';
import { CopyButton } from '@shared/components/copy-button';
import { FieldItem } from '../shared/FieldItem';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { Route } from '@/routes/rec-resource/$id/geospatial';
import { ROUTE_PATHS } from '@/constants/routes';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';
import { Link } from '@tanstack/react-router';
import { IMAP_URL } from '@/constants/urls';
import { buildImapUrlFromLatLng, buildImapUrlFromUtm } from '@/utils/imap';
import './RecResourceGeospatialSection.scss';
import { SpatialSubmissionSection } from '@/components/RecResourceSpatial/SpatialSubmissionSection';
import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { useGetExhibitADocs } from '@/services/hooks/recreation-resource-admin/useGetExhibitADocs';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { DocumentUploadModal } from '@/components/file/DocumentUploadModal';
import {
  useCreateOrGetExhibitAByApplicationGuid,
  useFinalizeExhibitAUpload,
  usePresignExhibitAUpload,
} from '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import {
  COLOR_BACKGROUND_GREY,
  COLOR_GOLD_DARK,
  COLOR_GREEN_DARKER,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY,
  COLOR_RED,
  COLOR_RED_LIGHT,
  COLOR_YELLOW_ADVISORY_BG,
} from '@/styles/colors';
import type { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin/models/PendingMapFeatureRequestRowDto';

const geometryNumberFormat: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
};

export function RecResourceGeospatialSection() {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { recResource } = useRecResource();
  const { isSuperAdmin } = useAuthorizations();
  const { user, authService } = useAuthContext();
  const queryClient = useQueryClient();
  const isArchived = recResource?.rec_status_code === 'AR';
  const [isSpatialSubmissionOpen, setIsSpatialSubmissionOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSubmissionRow, setSelectedSubmissionRow] =
    useState<PendingMapFeatureRequestRowDto | null>(null);
  const [exhibitAUrlBySubmission, setExhibitAUrlBySubmission] = useState<
    Record<string, string>
  >({});
  const [uploadModalState, setUploadModalState] = useState<{
    show: boolean;
    file: GalleryFile | null;
    fileName: string;
    fileNameError: string;
  }>({ show: false, file: null, fileName: '', fileNameError: '' });

  const { data: geospatialData } =
    useGetRecreationResourceGeospatial(recResourceId);
  const { data: pendingMapFeatureRequests } = useGetPendingMapFeatureRequests();
  const { data: exhibitADocs = [] } = useGetExhibitADocs(recResourceId);
  const presignMutation = usePresignExhibitAUpload();
  const finalizeMutation = useFinalizeExhibitAUpload();
  const regenerateMutation = useCreateOrGetExhibitAByApplicationGuid();

  const {
    latitude,
    longitude,
    utm_easting,
    utm_northing,
    utm_zone,
    total_length_km,
    total_area_hectares,
    right_of_way_m,
    section_ids,
  } = geospatialData || {};

  const hasGeometryData = utm_zone && utm_easting && utm_northing;

  const SITE_TYPE_CODES = ['IF', 'RR', 'SIT', 'RTR', 'TRB'];
  const TRAIL_TYPE_CODES = ['TBL', 'IFT', 'RTE'];

  const isTrail = TRAIL_TYPE_CODES.includes(
    recResource?.rec_resource_type_code ?? '',
  );
  const isSite = SITE_TYPE_CODES.includes(
    recResource?.rec_resource_type_code ?? '',
  );

  const geospatialItems = [
    {
      key: 'utm-zone',
      label: 'UTM zone',
      value: utm_zone?.toString(),
    },
    {
      key: 'utm-easting',
      label: 'UTM easting',
      value: utm_easting?.toString(),
    },
    {
      key: 'utm-northing',
      label: 'UTM northing',
      value: utm_northing?.toString(),
    },
    {
      key: 'latitude',
      label: 'Latitude',
      value: latitude ? <CopyButton text={String(latitude)} /> : undefined,
    },
    {
      key: 'longitude',
      label: 'Longitude',
      value: longitude ? <CopyButton text={String(longitude)} /> : undefined,
    },
    ...(isSite
      ? [
          {
            key: 'total-area',
            label: 'Total area (ha)',
            value:
              total_area_hectares != null
                ? `${total_area_hectares.toLocaleString('en-CA', geometryNumberFormat)}`
                : null,
          },
        ]
      : []),
    ...(isTrail
      ? [
          {
            key: 'total-length',
            label: 'Total length (km)',
            value:
              total_length_km != null
                ? `${total_length_km.toLocaleString('en-CA', geometryNumberFormat)}`
                : null,
          },
          {
            key: 'right-of-way',
            label: 'Right-of-way width (m)',
            value:
              right_of_way_m != null
                ? `${right_of_way_m.toLocaleString('en-CA', geometryNumberFormat)}`
                : null,
          },
        ]
      : []),
  ];

  const recResourceWithGeometry = recResource
    ? {
        ...recResource,
        site_point_geometry:
          geospatialData?.site_point_geometry ??
          recResource.site_point_geometry,
        spatial_feature_geometry:
          geospatialData?.spatial_feature_geometry ??
          recResource.spatial_feature_geometry,
      }
    : undefined;

  const imapUrl =
    latitude != null && longitude != null
      ? buildImapUrlFromLatLng(latitude, longitude)
      : utm_zone != null && utm_easting != null && utm_northing != null
        ? buildImapUrlFromUtm(utm_easting, utm_northing, utm_zone)
        : IMAP_URL;

  const formatSubmissionDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '-'
      : date.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
  };

  const buildSncscSubmissionUrl = (statusRequestGuid?: string | null) => {
    const sncscWebUrl =
      import.meta.env.VITE_SNCSC_WEB_URL || import.meta.env.SNCSC_WEB_URL || '';
    if (!sncscWebUrl || !statusRequestGuid) return null;
    return `${sncscWebUrl.replace(/\/+$/, '')}/${statusRequestGuid}`;
  };

  const getPurposeDisplay = (purposeCode?: string | null) => {
    const normalized = purposeCode?.toUpperCase().trim() ?? '';
    if (normalized === 'N') {
      return {
        label: 'NEW',
        bgColor: COLOR_GREEN_LIGHTEST,
        textColor: COLOR_GREEN_DARKER,
      };
    }
    if (normalized === 'A') {
      return {
        label: 'AMEND',
        bgColor: COLOR_YELLOW_ADVISORY_BG,
        textColor: COLOR_GOLD_DARK,
      };
    }
    if (normalized === 'R') {
      return {
        label: 'RETIRE',
        bgColor: COLOR_RED_LIGHT,
        textColor: COLOR_RED,
      };
    }

    return {
      label: '-',
      bgColor: COLOR_BACKGROUND_GREY,
      textColor: COLOR_GREY,
    };
  };

  const getStatusDisplay = (statusCode?: string | null) => {
    const normalized = statusCode?.toUpperCase().trim() ?? '';
    if (normalized.startsWith('PND') || normalized.includes('PEND')) {
      return {
        label: 'PENDING',
        bgColor: COLOR_YELLOW_ADVISORY_BG,
        textColor: COLOR_GOLD_DARK,
      };
    }
    if (normalized.startsWith('REJ') || normalized.includes('REJECT')) {
      return {
        label: 'REJECTED',
        bgColor: COLOR_RED_LIGHT,
        textColor: COLOR_RED,
      };
    }
    if (normalized.startsWith('APP') || normalized.includes('APPROV')) {
      return {
        label: 'APPROVED',
        bgColor: COLOR_GREEN_LIGHTEST,
        textColor: COLOR_GREEN_DARKER,
      };
    }

    return {
      label: normalized || '-',
      bgColor: COLOR_BACKGROUND_GREY,
      textColor: COLOR_GREY,
    };
  };

  const getExhibitAUrl = (row: PendingMapFeatureRequestRowDto) => {
    if (row.submission_id && exhibitAUrlBySubmission[row.submission_id]) {
      return exhibitAUrlBySubmission[row.submission_id];
    }

    const docUrl = exhibitADocs.find(
      (doc) => doc.submission_id === row.submission_id,
    )?.url;
    if (docUrl) {
      return docUrl;
    }

    return row.exhibit_a_url ?? null;
  };

  const getAdjudicationReportUrl = (row: PendingMapFeatureRequestRowDto) => {
    const url = row.adjudication_report;
    if (!url) return null;

    // Backward compatibility for older payloads still returning /api/v1 paths.
    return url.startsWith('/api/v1/') ? url.replace('/api/v1/', '/api/') : url;
  };

  const handleUploadStart = useCallback(
    (row: PendingMapFeatureRequestRowDto) => {
      if (!isSuperAdmin || !row.submission_id) return;
      setSelectedSubmissionRow(row);
      fileInputRef.current?.click();
    },
    [isSuperAdmin],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !selectedSubmissionRow?.submission_id) return;

      const tempId = crypto.randomUUID();
      const extension = file.name.split('.').pop() || 'pdf';
      const galleryFile: GalleryFile = {
        id: tempId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        date: '',
        url: '',
        extension,
        type: 'document',
        pendingFile: file,
      };

      setUploadModalState({
        show: true,
        file: galleryFile,
        fileName: galleryFile.name,
        fileNameError: '',
      });
    },
    [selectedSubmissionRow],
  );

  const handleUploadConfirm = useCallback(async () => {
    const selected = selectedSubmissionRow;
    const { file, fileName } = uploadModalState;
    if (!selected?.submission_id || !file?.pendingFile || !fileName) return;

    const rawName = `${fileName}.${file.extension}`;

    setUploadModalState((prev) => ({ ...prev, show: false }));

    try {
      const presigned = await presignMutation.mutateAsync({
        recResourceId,
        fileName: rawName,
      });

      const s3Response = await fetch(presigned.url, {
        method: 'PUT',
        body: file.pendingFile,
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!s3Response.ok) {
        throw new Error(
          `S3 upload failed: ${s3Response.status} ${s3Response.statusText}`,
        );
      }

      const finalized = await finalizeMutation.mutateAsync({
        recResourceId,
        submission_id: selected.submission_id,
        document_id: presigned.document_id,
        file_name: fileName,
        extension: file.extension,
        file_size: file.pendingFile.size,
      });

      setExhibitAUrlBySubmission((prev) => ({
        ...prev,
        [selected.submission_id!]: finalized.url,
      }));

      await queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.pendingRequests(),
      });

      addSuccessNotification('Exhibit A uploaded successfully.');
    } catch (error) {
      console.error('Exhibit A upload failed:', error);
      addErrorNotification('Failed to upload Exhibit A. Please try again.');
    }
  }, [
    finalizeMutation,
    presignMutation,
    queryClient,
    recResourceId,
    selectedSubmissionRow,
    uploadModalState,
  ]);

  const handleRegenerate = useCallback(
    async (row: PendingMapFeatureRequestRowDto) => {
      if (!row.application_guid || !row.submission_id || !isSuperAdmin) return;

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
        });

        setExhibitAUrlBySubmission((prev) => ({
          ...prev,
          [row.submission_id!]: result.pdfUrl,
        }));

        await queryClient.invalidateQueries({
          queryKey: RECREATION_RESOURCE_QUERY_KEYS.pendingRequests(),
        });

        addSuccessNotification('Exhibit A regenerated successfully.');
      } catch (error) {
        console.error('Exhibit A regeneration failed:', error);
        addErrorNotification(
          'Failed to regenerate Exhibit A. Please try again.',
        );
      }
    },
    [isSuperAdmin, queryClient, regenerateMutation, user],
  );

  const handleViewAdjudicationReport = useCallback(
    async (row: PendingMapFeatureRequestRowDto) => {
      const reportUrl = getAdjudicationReportUrl(row);
      if (!reportUrl) return;

      const popup = window.open('about:blank', '_blank');
      try {
        const token = await authService.getToken();
        const response = await fetch(reportUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(token ?? '')}`,
            Accept: 'application/pdf, application/octet-stream',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Adjudication report fetch failed: ${response.status} ${response.statusText} ${errorText}`,
          );
        }

        const bytes = await response.arrayBuffer();
        if (bytes.byteLength === 0) {
          throw new Error('Adjudication report response was empty.');
        }

        // Upstream may return octet-stream/attachment; force PDF for browser viewer.
        const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(pdfBlob);

        if (popup && !popup.closed) {
          popup.location.replace(objectUrl);
        } else {
          window.open(objectUrl, '_blank', 'noopener,noreferrer');
        }

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      } catch (error) {
        if (popup) {
          popup.close();
        }
        console.error('Adjudication report view failed:', error);
        addErrorNotification(
          'Unable to open adjudication report. Please try again.',
        );
      }
    },
    [authService],
  );

  const submissionRows = (pendingMapFeatureRequests?.data ?? [])
    .filter((row) => row.rec_resource_id === recResourceId)
    .sort((a, b) => {
      const aTime = a.requested_at ? Date.parse(a.requested_at) : 0;
      const bTime = b.requested_at ? Date.parse(b.requested_at) : 0;
      return bTime - aTime;
    });

  return (
    <Stack className="geospatial-section" direction="vertical" gap={4}>
      {/* ── Geospatial fields card ── */}
      <div className="geospatial-section__card">
        <div className="geospatial-section__card-header d-flex justify-content-between align-items-center">
          <h2 className="geospatial-section__card-title">Geospatial</h2>
          <EditableGuard isArchived={isArchived}>
            {hasGeometryData && (
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL_EDIT.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-outline-primary btn-sm"
              >
                Edit
              </Link>
            )}
          </EditableGuard>
        </div>

        <div className="geospatial-section__card-body">
          <Row className="gy-3">
            {geospatialItems.map((item) => (
              <Col key={item.key} xs={12} md={6} lg={4}>
                <FieldItem label={item.label} value={item.value} />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ── Location map ── */}
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
          <DataTable<PendingMapFeatureRequestRowDto>
            className="geospatial-submissions-table"
            columns={[
              {
                header: 'Submission ID',
                render: (row) => row.submission_id || '-',
              },
              {
                header: 'Date',
                render: (row) => formatSubmissionDate(row.requested_at),
              },
              {
                header: 'Reference',
                render: (row) => {
                  const statusRequestGuid = row.status_request_guid;
                  const sncscUrl = buildSncscSubmissionUrl(statusRequestGuid);
                  const adjudicationUrl = getAdjudicationReportUrl(row);

                  if (!sncscUrl && !adjudicationUrl) {
                    return <span className="text-muted">-</span>;
                  }

                  return (
                    <div className="d-flex align-items-center justify-content-center gap-3 w-100">
                      {sncscUrl ? (
                        <a
                          href={sncscUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="geospatial-submissions-reference"
                        >
                          SNCSC Link{' '}
                          <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            className="ms-1"
                          />
                        </a>
                      ) : null}
                      {adjudicationUrl ? (
                        <button
                          type="button"
                          className="geospatial-submissions-reference btn btn-link p-0"
                          onClick={() => {
                            void handleViewAdjudicationReport(row);
                          }}
                        >
                          Adj.Report{' '}
                          <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            className="ms-1"
                          />
                        </button>
                      ) : null}
                    </div>
                  );
                },
              },
              {
                header: 'Status',
                render: (row) => {
                  const status = getStatusDisplay(row.amend_status_code);
                  if (status.label === '-') {
                    return '-';
                  }

                  return (
                    <CustomBadge
                      label={status.label}
                      bgColor={status.bgColor}
                      textColor={status.textColor}
                    />
                  );
                },
              },
              {
                header: 'Purpose',
                render: (row) => {
                  const purposeCode = (
                    row as unknown as Record<string, unknown>
                  )['purpose_code'] as string | null | undefined;
                  const purpose = getPurposeDisplay(purposeCode);
                  if (purpose.label === '-') {
                    return '-';
                  }

                  return (
                    <CustomBadge
                      label={purpose.label}
                      bgColor={purpose.bgColor}
                      textColor={purpose.textColor}
                    />
                  );
                },
              },
              {
                header: 'Exhibit A',
                render: (row) => (
                  <div className="geospatial-submissions-actions">
                    {getExhibitAUrl(row) ? (
                      <a
                        href={getExhibitAUrl(row)!}
                        target="_blank"
                        rel="noreferrer"
                        className="geospatial-submissions-action-link"
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </a>
                    ) : (
                      <span className="geospatial-submissions-action-link geospatial-submissions-action-link--disabled">
                        <FontAwesomeIcon icon={faEye} /> View
                      </span>
                    )}
                    {getExhibitAUrl(row) ? (
                      <a
                        href={getExhibitAUrl(row)!}
                        download
                        className="geospatial-submissions-action-link"
                      >
                        <FontAwesomeIcon icon={faDownload} /> Download
                      </a>
                    ) : (
                      <span className="geospatial-submissions-action-link geospatial-submissions-action-link--disabled">
                        <FontAwesomeIcon icon={faDownload} /> Download
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="link"
                      className="geospatial-submissions-action-button"
                      disabled={
                        !isSuperAdmin ||
                        !row.submission_id ||
                        presignMutation.isPending ||
                        finalizeMutation.isPending
                      }
                      onClick={() => handleUploadStart(row)}
                      aria-label="Upload Exhibit A"
                    >
                      <FontAwesomeIcon icon={faArrowUpFromBracket} /> Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      className="geospatial-submissions-action-button"
                      disabled={
                        !isSuperAdmin ||
                        !row.application_guid ||
                        regenerateMutation.isPending
                      }
                      onClick={() => {
                        void handleRegenerate(row);
                      }}
                    >
                      <FontAwesomeIcon icon={faRotate} /> Regenerate
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={submissionRows}
            emptyMessage="No spatial submissions found."
            getRowKey={(row, index) =>
              `${row.rec_resource_id}-${row.requested_at ?? 'na'}-${index}`
            }
          />

          <EditableGuard isArchived={isArchived}>
            {!isSpatialSubmissionOpen ? (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsSpatialSubmissionOpen(true)}
                >
                  Create new
                </Button>
              </div>
            ) : null}
          </EditableGuard>

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
                existingSectionIds={section_ids ?? undefined}
                showCreateHeading={true}
                onCancel={() => setIsSpatialSubmissionOpen(false)}
              />
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="d-none"
            onChange={handleFileInputChange}
            aria-label="Upload Exhibit A document"
          />

          <DocumentUploadModal
            show={uploadModalState.show}
            file={uploadModalState.file}
            fileName={uploadModalState.fileName}
            showAlert={false}
            fileNameError={uploadModalState.fileNameError}
            onFileNameChange={(name) =>
              setUploadModalState((prev) => ({
                ...prev,
                fileName: name,
                fileNameError: '',
              }))
            }
            onCancel={() =>
              setUploadModalState((prev) => ({ ...prev, show: false }))
            }
            onConfirm={handleUploadConfirm}
            title="Upload Exhibit A document"
          />
        </div>
      </div>
    </Stack>
  );
}
