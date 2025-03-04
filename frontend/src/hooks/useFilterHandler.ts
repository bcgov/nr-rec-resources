import { useSearchParams } from 'react-router-dom';
import removeFilter from '@/utils/removeFilter';
import { filterChipStore } from '@/store';

const useFilterHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const toggleFilter = (
    id: string,
    label: string,
    param: string,
    isChecked?: boolean,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    const updateFilters = removeFilter(id, param, newSearchParams);

    if (isChecked) {
      newSearchParams.set(param, updateFilters ? `${updateFilters}_${id}` : id);
      setSearchParams(newSearchParams);
      filterChipStore.setState((prevState) => [
        ...prevState,
        { param, id, label },
      ]);
    } else {
      filterChipStore.setState((prevState) =>
        prevState.filter((filter) => filter.id !== id),
      );
      if (!updateFilters) {
        newSearchParams.delete(param);
      } else {
        newSearchParams.set(param, updateFilters);
      }
      setSearchParams(newSearchParams);
    }
  };

  return { toggleFilter };
};

export default useFilterHandler;
