import { AdvisoryDto } from '@/service/recreation-resource';
import AdvisoryItem from './AdvisoryItem';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import '@/components/rec-resource/section/AdvisoriesList.scss';

export interface AdvisoriesListProps {
  advisories: AdvisoryDto[];
}

const AdvisoriesList: React.FC<AdvisoriesListProps> = ({ advisories = [] }) => {
  // Track open IDs in a set for O(1) lookup
  const [openItems, setOpenItems] = useState<Set<number>>(
    new Set(advisories.length === 1 ? [advisories[0].advisory_number] : []),
  );

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (openItems.size === advisories.length) {
      setOpenItems(new Set()); // Collapse all
    } else {
      setOpenItems(new Set(advisories.map((a) => a.advisory_number))); // Expand all
    }
  };

  const allExpanded = openItems.size === advisories.length;

  if (!advisories || advisories.length === 0) {
    return null;
  }

  return (
    <section className="advisories-list">
      <h3>Advisories</h3>
      <Button variant="text" onClick={toggleAll} className="toggle-all-button">
        {allExpanded ? 'Collapse' : 'Expand'} all Advisories
        <FontAwesomeIcon
          className="toggle-all-arrow"
          icon={allExpanded ? faChevronUp : faChevronDown}
        />
      </Button>
      {advisories.map((advisory, index) => (
        <AdvisoryItem
          key={advisory.advisory_number}
          advisory={advisory}
          isLast={index === advisories.length - 1}
          isCollapsed={!openItems.has(advisory.advisory_number)}
          onToggle={() => toggleItem(advisory.advisory_number)}
        />
      ))}
    </section>
  );
};

export default AdvisoriesList;
