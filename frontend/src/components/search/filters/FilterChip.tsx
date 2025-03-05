import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import useFilterHandler from '@/components/search/hooks/useFilterHandler';
import { FilterChip as FilterChipProps } from '@/components/search/types';

const FilterChip = ({ param, id, label }: FilterChipProps) => {
  const { toggleFilter } = useFilterHandler();
  const handleFilterDelete = () => {
    toggleFilter({ param, id, label });
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
