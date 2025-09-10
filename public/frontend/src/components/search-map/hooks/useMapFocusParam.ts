import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchMapFocusModes } from '@/components/search-map/constants';

export function useMapFocusParam(): {
  mode?: SearchMapFocusModes;
  value?: string;
  resetParams: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const focus = searchParams.get('focus');

  // parse focus param
  const [mode, value] = useMemo(() => {
    if (!focus) return [undefined, undefined];

    const [modeStr, valueStr] = focus.split(':');
    const mode = Object.values(SearchMapFocusModes).includes(
      modeStr as SearchMapFocusModes,
    )
      ? (modeStr as SearchMapFocusModes)
      : undefined;

    return [mode, valueStr ?? undefined] as const;
  }, [focus]);

  const resetParams = useCallback(() => {
    searchParams.delete('focus');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return { mode, value, resetParams };
}
