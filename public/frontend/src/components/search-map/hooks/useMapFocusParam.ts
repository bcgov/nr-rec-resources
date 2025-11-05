import { useCallback, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { SearchMapFocusModes } from '@/components/search-map/constants';

export function useMapFocusParam(): {
  mode?: SearchMapFocusModes;
  value?: string;
  resetParams: () => void;
} {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });
  const focus = searchParams.focus;

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
    navigate({
      search: (prev) => {
        const newParams = { ...prev };
        delete newParams.focus;
        return newParams;
      },
      replace: true,
    });
  }, [navigate]);

  return { mode, value, resetParams };
}
