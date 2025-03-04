import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useFilterHandler } from '@/hooks';
import { FilterChip as FilterChipProps } from '@/components/search/types';

const FilterChip = ({ param, id, label }: FilterChipProps) => {
  const { toggleFilter } = useFilterHandler();
  const handleFilterDelete = () => {
    toggleFilter(id, label, param);
  };

  return (
    <button
      onClick={handleFilterDelete}
      className="btn btn-primary search-filter-chip"
    >
      {label}
      <FontAwesomeIcon icon={faCircleXmark} className="close-icon" />
    </button>
  );
};

export default FilterChip;
