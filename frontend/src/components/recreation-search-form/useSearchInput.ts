import { useState } from 'react';
import {
  URLSearchParamsInit,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ROUTE_PATHS } from '@/routes';

interface UseSearchInputProps {
  initialValue?: string;
}

interface UseSearchInputReturn {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSearch: () => void;
  handleClear: () => void;
}

const SEARCH_PARAM_KEY = 'filter';

export const useSearchInput = ({
  initialValue,
}: UseSearchInputProps = {}): UseSearchInputReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    initialValue ?? searchParams.get(SEARCH_PARAM_KEY) ?? '',
  );
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmedValue = inputValue.trim();
    const newParams = new URLSearchParams(searchParams);
    newParams.set(SEARCH_PARAM_KEY, trimmedValue);

    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  };

  const handleClear = () => {
    setInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(SEARCH_PARAM_KEY);
    setSearchParams(newParams as URLSearchParamsInit);
  };

  return {
    inputValue,
    setInputValue,
    handleSearch,
    handleClear,
  };
};
