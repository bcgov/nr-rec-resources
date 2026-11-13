import { noteSchema } from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/schemas/note';
import {
  NOTE_BODY_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
} from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/constants';
import { describe, expect, it } from 'vitest';

const messagesFor = (title: string, body: string) => {
  const result = noteSchema.safeParse({ title, body });
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe('noteSchema', () => {
  it('accepts a valid note', () => {
    expect(messagesFor('A title', '<p>Some body</p>')).toEqual([]);
  });

  it('requires a title', () => {
    expect(messagesFor('', '<p>body</p>')).toContain('Title is required');
  });

  it('treats a whitespace-only title as missing', () => {
    expect(messagesFor('   ', '<p>body</p>')).toContain('Title is required');
  });

  it('caps the title length', () => {
    expect(
      messagesFor('a'.repeat(NOTE_TITLE_MAX_LENGTH + 1), '<p>b</p>'),
    ).toContain(`Title must be ${NOTE_TITLE_MAX_LENGTH} characters or fewer`);
  });

  it('accepts a title at the limit', () => {
    expect(
      messagesFor('a'.repeat(NOTE_TITLE_MAX_LENGTH), '<p>body</p>'),
    ).toEqual([]);
  });

  it('requires body text rather than just markup', () => {
    expect(messagesFor('A title', '<p></p>')).toContain('Body is required');
    expect(messagesFor('A title', '<p><br></p>')).toContain('Body is required');
  });

  it('caps the body on its text length, ignoring markup', () => {
    const text = 'a'.repeat(NOTE_BODY_MAX_LENGTH);
    expect(messagesFor('A title', `<p><strong>${text}</strong></p>`)).toEqual(
      [],
    );
    expect(messagesFor('A title', `<p>${text}a</p>`)).toContain(
      `Body must be ${NOTE_BODY_MAX_LENGTH} characters or fewer`,
    );
  });
});
