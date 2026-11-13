import { useParams } from '@tanstack/react-router';
import { RecResourceNotesContent } from './RecResourceNotesContent';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetNotes } from '@/services/hooks/recreation-resource-admin/useGetNotes';

export const RecResourceNotesSection = () => {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';
  const { data: notes = [], isFetching } = useGetNotes(recResourceId);

  return (
    <RecResourceNotesContent
      notes={notes}
      recResourceId={recResourceId}
      isArchived={isArchived}
      isLoading={isFetching && notes.length === 0}
    />
  );
};
