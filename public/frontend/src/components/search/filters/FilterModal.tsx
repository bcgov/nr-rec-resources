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
  children,
  className = '',
}: FilterModalProps) => {
  const initialState = Object.fromEntries(params.map((p) => [p, false]));
  const [expandAll, setExpandAll] = useState(false);
  const [groupStates, setGroupStates] =
    useState<Record<string, boolean>>(initialState);

  const isGroupOpen = (param: string) => !!groupStates[param];

  const toggleGroup = (param: string) => {
    setGroupStates((prev) => ({
      ...prev,
      [param]: !prev[param],
    }));
  };

  const handleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    setGroupStates(Object.fromEntries(params.map((p) => [p, next])));
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
