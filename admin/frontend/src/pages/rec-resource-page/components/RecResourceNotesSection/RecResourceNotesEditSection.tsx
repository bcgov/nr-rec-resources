import { useParams } from '@tanstack/react-router';
import { RecResourceNotesEditContent } from './RecResourceNotesEditContent';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetNotes } from '@/services/hooks/recreation-resource-admin/useGetNotes';

export const RecResourceNotesEditSection = () => {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';
  const { data: notes = [] } = useGetNotes(recResourceId);

  return (
    <RecResourceNotesEditContent
      notes={notes}
      recResourceId={recResourceId}
      isArchived={isArchived}
    />
  );
};
