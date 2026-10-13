import { RecreationResourceNoteType } from '@/services/mocks/recreationResourceNotes';

export const NOTE_TYPE_LABELS: Record<RecreationResourceNoteType, string> = {
  NOTE: 'Note',
  REFERENCE: 'Reference',
  FILE: 'Associated file',
};

/**
 * Only the plain note flow is designed so far. The other two stay disabled in
 * the Add menu until their forms exist - see the open decisions in
 * local-docs/notes/initial-work.md.
 */
export const ENABLED_NOTE_TYPES: RecreationResourceNoteType[] = ['NOTE'];
