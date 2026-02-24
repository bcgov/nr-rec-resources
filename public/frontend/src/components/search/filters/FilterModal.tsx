import { useState, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronUp,
  faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import '@/components/search/filters/Filters.scss';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  params: string[];
  activeGroups?: string[];
  children: (helpers: {
    isGroupOpen: (param: string) => boolean;
    toggleGroup: (param: string) => void;
  }) => ReactNode;
  className?: string;
}

const FilterModal = ({
  isOpen,
  onClose,
  title = 'Filter',
  params,
  activeGroups = [],
  children,
  className = '',
}: FilterModalProps) => {
  const [expandAll, setExpandAll] = useState(false);
  const [toggledGroups, setToggledGroups] = useState<Record<string, boolean>>(
    {},
  );

  const isGroupOpen = (param: string) => {
    if (toggledGroups[param] !== undefined) return toggledGroups[param];
    return activeGroups.includes(param);
  };

  const toggleGroup = (param: string) => {
    setToggledGroups((prev) => ({
      ...prev,
      [param]: !isGroupOpen(param),
    }));
  };

  const handleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    setToggledGroups(Object.fromEntries(params.map((p) => [p, next])));
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      aria-labelledby="filter-modal"
      className={`filter-modal ${className}`}
      scrollable
    >
      <Modal.Body className="filter-modal-content">
        <div className="w-100">
          <div className="filter-modal-content--header">
            <h2 className="fs-4 mb-4">{title}</h2>
            <button
              aria-label="close"
              className="btn close-filter-btn"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <button className="show-all-link p-0" onClick={handleExpandAll}>
            {expandAll ? 'Collapse' : 'Expand'} all{' '}
            <FontAwesomeIcon icon={expandAll ? faChevronUp : faChevronDown} />
          </button>
        </div>

        {children({ isGroupOpen, toggleGroup })}
      </Modal.Body>
    </Modal>
  );
};

export default FilterModal;
