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

/**
 * Each date has its own `is_*_displayed` flag set upstream in ACT; a date is
 * only shown when its flag is on and the date itself is present.
 */
const getDateLines = (advisory: AdvisoryDto): AdvisoryDateLine[] => {
  const show = (isDisplayed: boolean, date?: Date) =>
    isDisplayed && date ? formatDateFull(date) : null;

  const start = show(
    advisory.is_effective_date_displayed,
    advisory.effective_date,
  );
  const end = show(advisory.is_end_date_displayed, advisory.end_date);
  const posted = show(
    advisory.is_advisory_date_displayed,
    advisory.advisory_date,
  );
  const updated = show(
    advisory.is_updated_date_displayed,
    advisory.updated_date,
  );

  const lines: AdvisoryDateLine[] = [];

  if (start && end) {
    // a range that starts and ends on the same day shows the date once
    lines.push({
      label: 'In effect',
      value: start === end ? start : `${start} to ${end}`,
    });
  } else if (start) {
    lines.push({ label: 'Starts', value: start });
  }
  if (posted) {
    lines.push({ label: 'Posted', value: posted });
  }
  if (updated) {
    lines.push({ label: 'Updated', value: updated });
  }

  return lines;
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
  const dateLines = getDateLines(advisory);

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
        {dateLines.length > 0 && (
          <div className="advisory-dates">
            {dateLines.map(({ label, value }) => (
              <p className="advisory-date" key={label}>
                {`${label}: `}
                <strong>{value}</strong>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisoryItem;
