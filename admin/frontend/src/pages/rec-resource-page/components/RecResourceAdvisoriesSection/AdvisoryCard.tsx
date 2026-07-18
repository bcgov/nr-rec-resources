import './RecResourceAdvisoriesSection.scss';
import {
  faArrowUpRightFromSquare,
  faCalendar,
  faCircleExclamation,
  faExclamationTriangle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import { CustomBadge } from '@/components/custom-badge';
import {
  COLOR_BLUE,
  COLOR_BLUE_LIGHT,
  COLOR_GOLD_DARK,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY_DARK,
} from '@/styles/colors';
import redAlertIcon from '@/assets/icons/red-alert.svg';
import { RecreationResourceAdvisoryDto } from '@/services/recreation-resource-admin';
import { formatDateFull, formatDateReadable } from '@shared/utils';
import { buildActAdvisoryEditUrl } from '@/utils/actUrls';

type AdvisoryCardProps = {
  advisory: RecreationResourceAdvisoryDto;
  staffAdminUrl: string;
};

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case 'High':
      return (
        <img
          src={redAlertIcon}
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
        />
      );
    case 'Medium':
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          style={{ color: COLOR_GOLD_DARK }}
          aria-hidden="true"
        />
      );
    default:
      return (
        <FontAwesomeIcon
          icon={faCircleExclamation}
          style={{ color: COLOR_BLUE }}
          aria-hidden="true"
        />
      );
  }
};

export const AdvisoryCard = ({
  advisory,
  staffAdminUrl,
}: AdvisoryCardProps) => {
  const eventDatesLabel = (() => {
    if (!advisory.is_effective_date_displayed) return null;
    const start = formatDateReadable(advisory.effective_date);
    if (!start) return null;
    if (advisory.is_end_date_displayed && advisory.end_date) {
      const end = formatDateReadable(advisory.end_date);
      const startYear = new Date(
        String(advisory.effective_date),
      ).getUTCFullYear();
      const endYear = new Date(advisory.end_date).getUTCFullYear();
      if (startYear === endYear) {
        const startNoYear = formatDateReadable(advisory.effective_date, {
          year: undefined,
        });
        return `${startNoYear} – ${end}`;
      }
      return `${start} – ${end}`;
    }
    return start;
  })();

  const editHref = buildActAdvisoryEditUrl(
    staffAdminUrl,
    advisory.advisory_number,
  );

  return (
    <Card className="border">
      <Card.Header className="border-bottom py-3">
        <Stack direction="vertical" gap={2}>
          <h3 className="fs-5 fw-bold mb-0">
            {advisory.event_type} - {advisory.access_status_name}
          </h3>
          <Stack direction="horizontal" gap={3} className="flex-wrap">
            <CustomBadge
              label={advisory.advisory_status}
              bgColor={
                advisory.advisory_status === 'Published'
                  ? COLOR_BLUE_LIGHT
                  : COLOR_GREEN_LIGHTEST
              }
              textColor={COLOR_GREY_DARK}
              fontWeight={700}
            />
            <Stack direction="horizontal" gap={1}>
              {getUrgencyIcon(advisory.urgency)}
              <span className="fw-bold">{advisory.urgency}</span>
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
