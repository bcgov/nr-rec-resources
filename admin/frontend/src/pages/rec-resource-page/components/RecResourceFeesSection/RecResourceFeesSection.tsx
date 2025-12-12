import { Route } from '@/routes/rec-resource/$id/fees';
import { RecResourceFeesTable } from './RecResourceFeesTable';

export const RecResourceFeesSection = () => {
  const { fees } = Route.useLoaderData();

  return (
    <div className="rounded">
      <div className="fw-bold mb-4">Current Fee Information</div>
      <RecResourceFeesTable fees={fees} />
    </div>
  );
};
