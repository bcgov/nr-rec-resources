import { CreateRecreationNoteDto } from '@/recreation-resources/notes/dto/create-recreation-note.dto';
import { RecreationNoteDto } from '@/recreation-resources/notes/dto/recreation-note.dto';
import { UpdateRecreationNoteDto } from '@/recreation-resources/notes/dto/update-recreation-note.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { NOTE_BODY_MAX_LENGTH } from '@/recreation-resources/notes/notes.constants';

describe('CreateRecreationNoteDto', () => {
  const makeDto = (title: string, body: string) => {
    const dto = new CreateRecreationNoteDto();
    dto.title = title;
    dto.body = body;
    return dto;
  };

  it('accepts a valid note', async () => {
    const errors = await validate(makeDto('A title', '<p>Some body</p>'));
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty title', async () => {
    const errors = await validate(makeDto('', '<p>Some body</p>'));
    expect(errors.map((e) => e.property)).toContain('title');
  });

  it('rejects a title over the limit', async () => {
    const errors = await validate(makeDto('a'.repeat(101), '<p>body</p>'));
    expect(errors.map((e) => e.property)).toContain('title');
  });

  it('rejects a body whose text is only markup', async () => {
    const errors = await validate(makeDto('A title', '<p></p>'));
    expect(errors.map((e) => e.property)).toContain('body');
  });

  it('rejects a body whose text exceeds the limit', async () => {
    const body = `<p>${'a'.repeat(NOTE_BODY_MAX_LENGTH + 1)}</p>`;
    const errors = await validate(makeDto('A title', body));
    expect(errors.map((e) => e.property)).toContain('body');
  });

  it('allows markup to push the raw string past the text limit', async () => {
    const text = 'a'.repeat(NOTE_BODY_MAX_LENGTH - 1);
    const body = `<p><strong>${text}</strong></p>`;
    expect(body.length).toBeGreaterThan(NOTE_BODY_MAX_LENGTH);

    const errors = await validate(makeDto('A title', body));
    expect(errors).toHaveLength(0);
  });
});

describe('UpdateRecreationNoteDto', () => {
  it('allows a partial payload', async () => {
    const dto = new UpdateRecreationNoteDto();
    dto.title = 'Only the title';

    expect(await validate(dto)).toHaveLength(0);
  });

  it('allows an empty payload', async () => {
    expect(await validate(new UpdateRecreationNoteDto())).toHaveLength(0);
  });

  it('still validates fields that are present', async () => {
    const dto = new UpdateRecreationNoteDto();
    dto.title = 'a'.repeat(101);

    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toContain('title');
  });
});

describe('RecreationNoteDto', () => {
  it('holds the fields the API returns', () => {
    const dto = new RecreationNoteDto();
    dto.note_id = '0f8fad5b-d9cb-469f-a165-70867728950e';
    dto.rec_resource_id = 'REC0019';
    dto.note_type_code = 'NOTE';
    dto.title = 'A title';
    dto.body = '<p>body</p>';
    dto.date_logged = '2026-05-14';
    dto.created_by = 'IDIR\\jdoe';
    dto.is_editable = true;

    expect(dto).toEqual({
      note_id: '0f8fad5b-d9cb-469f-a165-70867728950e',
      rec_resource_id: 'REC0019',
      note_type_code: 'NOTE',
      title: 'A title',
      body: '<p>body</p>',
      date_logged: '2026-05-14',
      created_by: 'IDIR\\jdoe',
      is_editable: true,
    });
  });

  it('allows a null created_by', () => {
    const dto = new RecreationNoteDto();
    dto.created_by = null;
    expect(dto.created_by).toBeNull();
  });
});
