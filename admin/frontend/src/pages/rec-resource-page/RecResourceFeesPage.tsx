import { RecResourceFeesSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import { useLoaderData } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';

export const RecResourceFeesPage = () => {
  const { fees } = useLoaderData({ from: '/rec-resource/$id/fees' });

  return (
    <Stack direction="vertical" gap={4}>
      <h2>Fees</h2>
      <RecResourceFeesSection fees={fees} />
    </Stack>
  );
};
