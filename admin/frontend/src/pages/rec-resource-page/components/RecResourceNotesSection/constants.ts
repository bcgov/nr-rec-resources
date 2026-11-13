export const NOTE_TYPE_LABELS: Record<string, string> = {
  NOTE: 'Note',
  REFERENCE: 'Reference',
  FILE: 'Associated file',
  FIELD_NOTE: 'Field note',
  OBJECTIVE: 'Objective',
};

export const getNoteTypeLabel = (noteTypeCode: string) =>
  NOTE_TYPE_LABELS[noteTypeCode] ?? NOTE_TYPE_LABELS.NOTE;
