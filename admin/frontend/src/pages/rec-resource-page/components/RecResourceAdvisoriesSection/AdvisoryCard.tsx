import './RecResourceAdvisoriesSection.scss';
import {
  faArrowUpRightFromSquare,
  faCalendar,
  faCircleExclamation,
  faCircleInfo,
  faExclamationTriangle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import { RecreationResourceAdvisoryDto } from '@/services/recreation-resource-admin';
import { formatDateFull, formatDateReadable } from '@shared/utils';

type AdvisoryCardProps = {
  advisory: RecreationResourceAdvisoryDto;
  staffAdminUrl: string;
};

const URGENCY_CONFIG: Record<
  string,
  { icon: typeof faCircleInfo; className: string }
> = {
  Low: { icon: faCircleInfo, className: 'text-primary' },
  Medium: { icon: faExclamationTriangle, className: 'text-warning' },
  High: { icon: faCircleExclamation, className: 'text-danger' },
};

const getUrgencyConfig = (urgency: string) =>
  URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.Low;

export const AdvisoryCard = ({
  advisory,
  staffAdminUrl,
}: AdvisoryCardProps) => {
  const urgencyConfig = getUrgencyConfig(advisory.urgency);

  const eventDatesLabel = (() => {
    if (!advisory.is_effective_date_displayed) return null;
    const start = formatDateReadable(advisory.effective_date);
    if (!start) return null;
    if (advisory.is_end_date_displayed && advisory.end_date) {
      const end = formatDateReadable(advisory.end_date);
      return `${start} – ${end}`;
    }
    return start;
  })();

  const editHref = `${staffAdminUrl}/advisory-link/${advisory.advisory_number}?idp=idir`;

  return (
    <Card className="border">
      <Card.Header className="border-bottom py-3">
        <Stack direction="vertical" gap={2}>
          <h3 className="fs-5 fw-bold mb-0">
            {advisory.event_type} - {advisory.access_status_name}
          </h3>
          <Stack direction="horizontal" gap={3} className="flex-wrap">
            <span className="badge rounded-pill bg-light text-dark border">
              {advisory.advisory_status}
            </span>
            <Stack direction="horizontal" gap={1}>
              <FontAwesomeIcon
                icon={urgencyConfig.icon}
                className={urgencyConfig.className}
                aria-hidden="true"
              />
              <span>{advisory.urgency}</span>
            </Stack>
            {eventDatesLabel && (
              <Stack direction="horizontal" gap={1}>
                <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                <span>
                  <span className="fw-semibold me-2">Event dates</span>
                  {eventDatesLabel}
                </span>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Card.Header>

      <Card.Body className="py-3">
        <Row className="gy-3 mb-3">
          <Col xs={6} md={3}>
            <Stack direction="vertical" gap={1}>
              <div className="advisories-card-label small d-flex align-items-center gap-1">
                <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                <span className="fw-semibold">Posted</span>
              </div>
              <div>{formatDateFull(advisory.advisory_date) ?? '-'}</div>
            </Stack>
          </Col>
          <Col xs={6} md={3}>
            <Stack direction="vertical" gap={1}>
              <div className="advisories-card-label small d-flex align-items-center gap-1">
                <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                <span className="fw-semibold">Expiry</span>
              </div>
              <div>{formatDateFull(advisory.expiry_date) ?? '-'}</div>
            </Stack>
          </Col>
          <Col xs={6} md={3}>
            <Stack direction="vertical" gap={1}>
              <div className="advisories-card-label small d-flex align-items-center gap-1">
                <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                <span className="fw-semibold">Last updated</span>
              </div>
              <div>{formatDateFull(advisory.updated_date) ?? '-'}</div>
            </Stack>
          </Col>
          <Col xs={6} md={3}>
            <Stack direction="vertical" gap={1}>
              <div className="advisories-card-label small d-flex align-items-center gap-1">
                <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                <span className="fw-semibold">Published by</span>
              </div>
              <div>{advisory.submitted_by}</div>
            </Stack>
          </Col>
        </Row>

        <a
          href={editHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm advisories-action-btn gap-2"
        >
          Edit advisory
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
        </a>
      </Card.Body>
    </Card>
  );
};
