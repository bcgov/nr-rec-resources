import { useQuery } from '~/@tanstack/react-query';

export const useGetMapStyles = () =>
  useQuery({
    queryKey: ['mapStyle'],
    queryFn: async () => {
      const response = await fetch(
        'https://www.arcgis.com/sharing/rest/content/items/b1624fea73bd46c681fab55be53d96ae/resources/styles/root.json',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      return response.json();
    },
  });
