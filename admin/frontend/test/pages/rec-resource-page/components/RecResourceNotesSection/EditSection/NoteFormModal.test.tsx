import { NoteFormModal } from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/NoteFormModal';
import { NOTE_CREATE_CALLOUT } from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/constants';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="icon" {...props} />,
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/NoteForm',
  () => ({
    NoteForm: ({ mode, initialNote, onCancel, onDelete, onDone }: any) => (
      <div
        data-testid="note-form"
        data-mode={mode}
        data-note={initialNote?.note_id}
      >
        <button onClick={onCancel}>form cancel</button>
        <button onClick={onDone}>form done</button>
        {onDelete ? <button onClick={onDelete}>form delete</button> : null}
      </div>
    ),
  }),
);

const note: RecreationNoteDto = {
  note_id: 'n1',
  rec_resource_id: 'REC0019',
  note_type_code: 'NOTE',
  title: 'A title',
  body: '<p>body</p>',
  date_logged: '2026-05-14',
  created_by: 'IDIR\\jdoe',
  is_editable: true,
};

describe('NoteFormModal', () => {
  it('titles the dialog for create mode and shows the callout', () => {
    render(
      <NoteFormModal recResourceId="REC0019" mode="create" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Add new note')).toBeInTheDocument();
    expect(screen.getByText(NOTE_CREATE_CALLOUT)).toBeInTheDocument();
  });

  it('titles the dialog for edit mode without the callout', () => {
    render(
      <NoteFormModal
        recResourceId="REC0019"
        mode="edit"
        initialNote={note}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Edit note')).toBeInTheDocument();
    expect(screen.queryByText(NOTE_CREATE_CALLOUT)).not.toBeInTheDocument();
  });

  it('passes the mode and note down to the form', () => {
    render(
      <NoteFormModal
        recResourceId="REC0019"
        mode="edit"
        initialNote={note}
        onClose={vi.fn()}
      />,
    );

    const form = screen.getByTestId('note-form');
    expect(form).toHaveAttribute('data-mode', 'edit');
    expect(form).toHaveAttribute('data-note', 'n1');
  });

  it('says so when an edit has no note to edit', () => {
    render(
      <NoteFormModal recResourceId="REC0019" mode="edit" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Note not found.')).toBeInTheDocument();
    expect(screen.queryByTestId('note-form')).not.toBeInTheDocument();
  });

  it('closes on cancel and on done', async () => {
    const onClose = vi.fn();
    render(
      <NoteFormModal recResourceId="REC0019" mode="create" onClose={onClose} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'form cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'form done' }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('only wires delete when a handler is given', () => {
    const { rerender } = render(
      <NoteFormModal recResourceId="REC0019" mode="create" onClose={vi.fn()} />,
    );

    expect(
      screen.queryByRole('button', { name: 'form delete' }),
    ).not.toBeInTheDocument();

    rerender(
      <NoteFormModal
        recResourceId="REC0019"
        mode="edit"
        initialNote={note}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'form delete' }),
    ).toBeInTheDocument();
  });

  it('renders nothing when hidden', () => {
    render(
      <NoteFormModal
        recResourceId="REC0019"
        mode="create"
        onClose={vi.fn()}
        show={false}
      />,
    );

    expect(screen.queryByTestId('note-form')).not.toBeInTheDocument();
  });
});
