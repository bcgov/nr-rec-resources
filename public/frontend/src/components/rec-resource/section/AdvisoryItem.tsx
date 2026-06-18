import { AdvisoryDto } from '@/service/recreation-resource';
import { SafeHtml } from '@shared/components/safe-html';
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
        {advisory.is_advisory_date_displayed && (
          <p className="advisory-date">
            Posted{' '}
            {advisory.advisory_date && (
              <strong>
                {new Date(advisory.advisory_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvisoryItem;
