import { RecreationResourceNoteType } from '@/services/mocks/recreationResourceNotes';

/**
 * The model carries a type so references and associated files can be added
 * later, but only plain notes are in scope for now - there's no way to create
 * the other two, and everything imported from FTA comes in as a NOTE.
 */
export const NOTE_TYPE_LABELS: Record<RecreationResourceNoteType, string> = {
  NOTE: 'Note',
  REFERENCE: 'Reference',
  FILE: 'Associated file',
};
