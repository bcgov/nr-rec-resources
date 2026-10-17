import { RecResourceNotesEditContent } from '@/pages/rec-resource-page/components/RecResourceNotesSection/RecResourceNotesEditContent';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import { addSuccessNotification } from '@/store/notificationStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockMutateAsync = vi.fn();
vi.mock('@/services/hooks/recreation-resource-admin/useDeleteNote', () => ({
  useDeleteNote: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: vi.fn(),
  addErrorNotification: vi.fn(),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection',
  () => ({
    NoteFormModal: ({ mode, initialNote, onClose, onDelete }: any) => (
      <div
        data-testid="note-form-modal"
        data-mode={mode}
        data-note={initialNote?.note_id}
      >
        <button onClick={onClose}>close modal</button>
        <button onClick={onDelete}>delete from modal</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/components/delete-confirmation-modal/DeleteConfirmationModal',
  () => ({
    DeleteConfirmationModal: ({ show, onConfirm, onCancel, title }: any) =>
      show ? (
        <div data-testid="delete-modal">
          <span>{title}</span>
          <button onClick={onConfirm}>confirm remove</button>
          <button onClick={onCancel}>cancel remove</button>
        </div>
      ) : null,
  }),
);

const makeNote = (
  id: string,
  overrides: Partial<RecreationNoteDto> = {},
): RecreationNoteDto => ({
  note_id: id,
  rec_resource_id: 'REC0019',
  note_type_code: 'NOTE',
  title: `Title ${id}`,
  body: `<p>Body ${id}</p>`,
  date_logged: '2026-05-14',
  created_by: 'IDIR\\jdoe',
  is_editable: true,
  ...overrides,
});

describe('RecResourceNotesEditContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthorizations.mockReturnValue({
      canEdit: true,
      isSuperAdmin: false,
    });
    mockMutateAsync.mockResolvedValue(undefined);
  });

  const renderContent = (notes: RecreationNoteDto[]) =>
    render(
      <RecResourceNotesEditContent notes={notes} recResourceId="REC0019" />,
    );

  it('renders the edit heading', () => {
    renderContent([]);

    expect(screen.getByText('Edit notes and references')).toBeInTheDocument();
  });

  it('shows the empty state with no notes', () => {
    renderContent([]);

    expect(
      screen.getByText('No notes or references have been added'),
    ).toBeInTheDocument();
  });

  it('navigates back to the view page from Done', async () => {
    renderContent([]);

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/rec-resource/REC0019/notes',
    });
  });

  it('offers edit and remove for an editable note', () => {
    renderContent([makeNote('n1')]);

    expect(
      screen.getByRole('button', { name: 'Edit note Title n1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove note Title n1' }),
    ).toBeInTheDocument();
  });

  it('offers neither for an imported note', () => {
    renderContent([makeNote('n1', { is_editable: false })]);

    expect(
      screen.queryByRole('button', { name: /^Edit note/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Remove note/ }),
    ).not.toBeInTheDocument();
  });

  it('opens the edit modal for the chosen note', async () => {
    renderContent([makeNote('n1'), makeNote('n2')]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit note Title n2' }),
    );

    const modal = screen.getByTestId('note-form-modal');
    expect(modal).toHaveAttribute('data-mode', 'edit');
    expect(modal).toHaveAttribute('data-note', 'n2');
  });

  it('closes the edit modal again', async () => {
    renderContent([makeNote('n1')]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit note Title n1' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'close modal' }));

    expect(screen.queryByTestId('note-form-modal')).not.toBeInTheDocument();
  });

  it('asks for confirmation before removing', async () => {
    renderContent([makeNote('n1')]);

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove note Title n1' }),
    );

    expect(screen.getByText('Remove this note?')).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('deletes the note once confirmed', async () => {
    renderContent([makeNote('n1')]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove note Title n1' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'confirm remove' }),
    );

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        recResourceId: 'REC0019',
        noteId: 'n1',
      }),
    );
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Note removed successfully',
      'deleteNote-success',
    );
  });

  it('keeps the note when the confirmation is cancelled', async () => {
    renderContent([makeNote('n1')]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove note Title n1' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'cancel remove' }),
    );

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('can reach the confirmation from inside the edit modal', async () => {
    renderContent([makeNote('n1')]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit note Title n1' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'delete from modal' }),
    );

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('closes both modals after deleting from the edit modal', async () => {
    renderContent([makeNote('n1')]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit note Title n1' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'delete from modal' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'confirm remove' }),
    );

    await waitFor(() =>
      expect(screen.queryByTestId('note-form-modal')).not.toBeInTheDocument(),
    );
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });
});
