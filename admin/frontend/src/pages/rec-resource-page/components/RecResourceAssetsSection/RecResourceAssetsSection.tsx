// import { useParams } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';

export function RecResourceAssetsSection() {
  // const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });

  return (
    <Stack direction="vertical" gap={3}>
      <div>
        <h2 className="fs-4">Asset summary</h2>
        <p className="text-muted mb-0">Data will go here</p>
      </div>
    </Stack>
  );
}
