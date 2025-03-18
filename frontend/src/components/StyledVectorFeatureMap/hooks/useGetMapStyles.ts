import { useQuery, UseQueryResult } from '~/@tanstack/react-query';
import { MAP_URLS } from '@/components/StyledVectorFeatureMap/constants';

/**
 * Custom hook to fetch map styles.
 */
export const useGetMapStyles = (): UseQueryResult =>
  useQuery({
    queryKey: ['mapStyle'],
    queryFn: async () => {
      const response = await fetch(MAP_URLS.styles, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
  });
