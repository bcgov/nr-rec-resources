import { RecreationAccessDto } from '@/services';
import { Stack } from 'react-bootstrap';

// Helper function to format recreation access with sub access information
export const formatRecreationAccess = (
  recreation_access: RecreationAccessDto[],
) => {
  if (recreation_access.length === 0) {
    return null;
  }

  return (
    <Stack direction="vertical" gap={1}>
      {recreation_access.map((access, index) => (
        <Stack direction="horizontal" key={index} className="mb-1" gap={1}>
          <span>{access.description}</span>
          {access.sub_access_description && (
            <span>({access.sub_access_description})</span>
          )}
        </Stack>
      ))}
    </Stack>
  );
};
