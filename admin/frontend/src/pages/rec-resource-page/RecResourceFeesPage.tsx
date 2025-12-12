import { RecResourceFeesSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import { Stack } from 'react-bootstrap';

export function RecResourceFeesPage() {
  return (
    <Stack direction="vertical" gap={4}>
      <h2>Fees</h2>
      <RecResourceFeesSection />
    </Stack>
  );
}
