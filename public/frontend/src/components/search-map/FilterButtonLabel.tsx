import React from 'react';
import './FilterButtonLabel.scss';

interface FilterButtonLabelProps {
  selectedFilterCount: number;
}

const FilterButtonLabel: React.FC<FilterButtonLabelProps> = ({
  selectedFilterCount,
}) => (
  <span className="filter-btn-content">
    Filters
    {selectedFilterCount > 0 && (
      <span
        className="filter-count"
        aria-label={`${selectedFilterCount} filters selected`}
      >
        {selectedFilterCount}
      </span>
    )}
  </span>
);

export default FilterButtonLabel;
