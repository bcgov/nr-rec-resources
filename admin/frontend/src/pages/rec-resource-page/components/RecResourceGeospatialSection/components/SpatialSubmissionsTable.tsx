import { Button } from 'react-bootstrap';
import {
  faArrowUpFromBracket,
  faArrowUpRightFromSquare,
  faDownload,
  faEye,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table as DataTable } from '@/components';
import { CustomBadge } from '@/components/custom-badge';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useFileDownload } from '@/pages/rec-resource-page/hooks/useFileDownload';
import type { ExhibitADocDto } from '@/services/recreation-resource-admin';
import type { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin/models/PendingMapFeatureRequestRowDto';
import {
  buildSncscSubmissionUrl,
  formatSubmissionDate,
  getPurposeDisplay,
  getStatusDisplay,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/submissionDisplay';
import { resolveExhibitAUrl } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/exhibitA';

type Props = Readonly<{
  rows: PendingMapFeatureRequestRowDto[];
  exhibitADocs: ExhibitADocDto[];
  exhibitAUrlOverrides: Record<string, string>;
  isUploading: boolean;
  isRegenerating: boolean;
  onViewAdjudicationReport: (applicationGuid?: string | null) => void;
  onUpload: (row: PendingMapFeatureRequestRowDto) => void;
  onRegenerate: (row: PendingMapFeatureRequestRowDto) => void;
}>;

const DISABLED_LINK_CLASS =
  'geospatial-submissions-action-link geospatial-submissions-action-link--disabled';

export function SpatialSubmissionsTable({
  rows,
  exhibitADocs,
  exhibitAUrlOverrides,
  isUploading,
  isRegenerating,
  onViewAdjudicationReport,
  onUpload,
  onRegenerate,
}: Props) {
  const authorizations = useAuthorizations();
  const { isSuperAdmin } = authorizations;
  const canViewAdjudicationReports =
    (
      authorizations as {
        canViewAdjudicationReports?: boolean;
      }
    ).canViewAdjudicationReports ?? authorizations.canViewSensitiveInfo;
  const downloadMutation = useFileDownload();

  return (
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
            const sncscUrl = buildSncscSubmissionUrl(row.status_request_guid);
            const canViewReport =
              canViewAdjudicationReports &&
              Boolean(row.adjudication_report && row.application_guid);

            if (!sncscUrl && !canViewReport) {
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
                {canViewReport ? (
                  <button
                    type="button"
                    className="geospatial-submissions-reference btn btn-link p-0"
                    onClick={() =>
                      onViewAdjudicationReport(row.application_guid)
                    }
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
            if (status.label === '-') return '-';
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
            const purposeCode = (row as unknown as Record<string, unknown>)[
              'purpose_code'
            ] as string | null | undefined;
            const purpose = getPurposeDisplay(purposeCode);
            if (purpose.label === '-') return '-';
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
          render: (row) => {
            const normalizedStatus = row.amend_status_code
              ?.toUpperCase()
              .trim();
            const canRegenerateForStatus =
              normalizedStatus === 'PND' ||
              normalizedStatus === 'APP' ||
              normalizedStatus === 'CLR';
            const exhibitAUrl = resolveExhibitAUrl(
              row,
              exhibitADocs,
              exhibitAUrlOverrides,
            );

            return (
              <div className="geospatial-submissions-actions">
                {exhibitAUrl ? (
                  <a
                    href={exhibitAUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="geospatial-submissions-action-link"
                  >
                    <FontAwesomeIcon icon={faEye} /> View
                  </a>
                ) : (
                  <span className={DISABLED_LINK_CLASS}>
                    <FontAwesomeIcon icon={faEye} /> View
                  </span>
                )}

                {exhibitAUrl ? (
                  <Button
                    size="sm"
                    variant="link"
                    className="geospatial-submissions-action-button"
                    disabled={downloadMutation.isPending}
                    onClick={() =>
                      downloadMutation.mutate({
                        file: {
                          id:
                            row.submission_id ??
                            row.application_guid ??
                            'exhibit-a',
                          name: `exhibit-a-${row.submission_id ?? row.application_guid}`,
                          url: exhibitAUrl,
                          extension: 'pdf',
                          date: '',
                          type: 'document',
                        },
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </Button>
                ) : (
                  <span className={DISABLED_LINK_CLASS}>
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </span>
                )}

                <Button
                  size="sm"
                  variant="link"
                  className="geospatial-submissions-action-button"
                  disabled={!isSuperAdmin || !row.submission_id || isUploading}
                  onClick={() => onUpload(row)}
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
                    !canRegenerateForStatus ||
                    isRegenerating
                  }
                  title={
                    !canRegenerateForStatus
                      ? 'Exhibit A can only be regenerated for pending, approved, or cleared submissions.'
                      : undefined
                  }
                  onClick={() => onRegenerate(row)}
                >
                  <FontAwesomeIcon icon={faRotate} /> Regenerate
                </Button>
              </div>
            );
          },
        },
      ]}
      rows={rows}
      emptyMessage="No spatial submissions found."
      getRowKey={(row, index) =>
        `${row.rec_resource_id}-${row.requested_at ?? 'na'}-${index}`
      }
    />
  );
}
