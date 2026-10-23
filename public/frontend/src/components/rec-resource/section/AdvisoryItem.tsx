import { AdvisoryDto } from '@/service/recreation-resource';
import { SafeHtml } from '@shared/components/safe-html';
import { formatDateFull } from '@shared/utils';
import blueIcon from '@/images/icons/advisories/blue-icon.svg';
import yellowIcon from '@/images/icons/advisories/yellow-icon.svg';
import redIcon from '@/images/icons/advisories/red-icon.svg';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AdvisoriesItemProps {
  advisory: AdvisoryDto;
  isLast?: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface AdvisoryDateLine {
  label: string;
  value: string;
}

// advisory dates are BC events authored in Pacific time, so the calendar date
// staff picked is the one every viewer should see
const PACIFIC = { timeZone: 'America/Vancouver' } as const;

/**
 * Picks the single date line to display.
 *
 * ACT staff choose one "Displayed date" option, which writes all four
 * `is_*_displayed` flags at once, so exactly one of the shapes below should be
 * flagged.
 */
const getDateLine = (advisory: AdvisoryDto): AdvisoryDateLine | null => {
  const displayed = (isDisplayed: boolean, date?: Date) =>
    isDisplayed && date ? formatDateFull(date, PACIFIC) : null;

  const posted = displayed(
    advisory.is_advisory_date_displayed,
    advisory.advisory_date,
  );
  if (posted) {
    return { label: 'Posted', value: posted };
  }

  const updated = displayed(
    advisory.is_updated_date_displayed,
    advisory.updated_date,
  );
  if (updated) {
    return { label: 'Updated', value: updated };
  }

  // the end date never shows without the effective date
  const start = displayed(
    advisory.is_effective_date_displayed,
    advisory.effective_date,
  );
  if (!start) {
    return null;
  }

  const end = displayed(advisory.is_end_date_displayed, advisory.end_date);
  if (!end) {
    return { label: 'Starts', value: start };
  }

  // a range that starts and ends on the same day shows the date once
  return {
    label: 'In effect',
    value: start === end ? start : `${start} to ${end}`,
  };
};

const getIconForUrgency = (urgency: string) => {
  switch (urgency) {
    case 'Low':
      return blueIcon;
    case 'Medium':
      return yellowIcon;
    case 'High':
      return redIcon;
    default:
      return redIcon;
  }
};

const AdvisoryItem: React.FC<AdvisoriesItemProps> = ({
  advisory,
  isLast,
  isCollapsed,
  onToggle,
}) => {
  const dateLine = getDateLine(advisory);

  return (
    <div className={`advisory-item ${isLast ? 'advisory-item--last' : ''}`}>
      <div
        className={`advisory-header ${isCollapsed ? 'collapsed' : ''}`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggle();
          }
        }}
      >
        <img
          src={getIconForUrgency(advisory.urgency)}
          alt="Advisory Icon"
          className="advisory-icon"
        />
        <span className="advisory-title">{advisory.title}</span>
        <span className="advisory-arrow">
          {isCollapsed ? (
            <FontAwesomeIcon icon={faChevronDown} />
          ) : (
            <FontAwesomeIcon icon={faChevronUp} />
          )}
        </span>
      </div>
      <div hidden={isCollapsed}>
        <div className="advisory-description">
          {advisory.description && <SafeHtml html={advisory.description} />}
        </div>
        {dateLine && (
          <p className="advisory-date">
            {`${dateLine.label}: `}
            <strong>{dateLine.value}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvisoryItem;
