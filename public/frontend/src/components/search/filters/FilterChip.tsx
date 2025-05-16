import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useFilterHandler } from '@/components/search/hooks/useFilterHandler';
import { FilterChip as FilterChipProps } from '@/components/search/types';
import { Button } from 'react-bootstrap';

const FilterChip = ({ param, id, label }: FilterChipProps) => {
  const { toggleFilter } = useFilterHandler();
  const handleFilterDelete = () => {
    toggleFilter({ param, id, label });
  };

  return (
    <Button onClick={handleFilterDelete} className="search-filter-chip">
      {label}
      <FontAwesomeIcon icon={faCircleXmark} className="close-icon" />
    </Button>
  );
};

export default FilterChip;
