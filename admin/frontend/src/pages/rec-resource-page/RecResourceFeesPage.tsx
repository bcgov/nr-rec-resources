import { RecResourceFeesSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import { useParams } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';

export const RecResourceFeesPage = () => {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id/fees' });

  return (
    <Stack direction="vertical" gap={4}>
      <h2>Fees</h2>
      <RecResourceFeesSection recResourceId={recResourceId} />
    </Stack>
  );
};
