import { z } from 'zod';
import { getPlainText } from '@/components/form/rich-text-editor';
import {
  NOTE_BODY_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
} from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/constants';

// Both limits count what the user typed, not the markup around it.
export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(
      NOTE_TITLE_MAX_LENGTH,
      `Title must be ${NOTE_TITLE_MAX_LENGTH} characters or fewer`,
    ),
  body: z
    .string()
    .refine((html) => getPlainText(html).trim().length > 0, 'Body is required')
    .refine(
      (html) => getPlainText(html).length <= NOTE_BODY_MAX_LENGTH,
      `Body must be ${NOTE_BODY_MAX_LENGTH} characters or fewer`,
    ),
});

export type NoteFormData = z.infer<typeof noteSchema>;
