import { useNoteForm } from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/hooks/useNoteForm';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import { addSuccessNotification } from '@/store/notificationStore';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthContext = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
vi.mock('@/services/hooks/recreation-resource-admin', () => ({
  useCreateNote: () => ({ mutateAsync: mockCreate, isPending: false }),
  useUpdateNote: () => ({ mutateAsync: mockUpdate, isPending: false }),
}));

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: vi.fn(),
  addErrorNotification: vi.fn(),
}));

const existingNote: RecreationNoteDto = {
  note_id: 'n1',
  rec_resource_id: 'REC0019',
  note_type_code: 'NOTE',
  title: 'Existing title',
  body: '<p>Existing body</p>',
  date_logged: '2026-01-02',
  created_by: 'IDIR\\someone',
  is_editable: true,
};

describe('useNoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { idir_username: 'jdoe' } });
    mockCreate.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
  });

  const setup = (overrides: Record<string, unknown> = {}) =>
    renderHook(() =>
      useNoteForm({
        recResourceId: 'REC0019',
        mode: 'create',
        ...overrides,
      } as any),
    );

  describe('create mode', () => {
    it('previews the signed-in user as the author', () => {
      const { result } = setup();

      expect(result.current.createdBy).toBe('IDIR\\jdoe');
    });

    it('falls back to an empty author without a username', () => {
      mockUseAuthContext.mockReturnValue({ user: undefined });

      const { result } = setup();

      expect(result.current.createdBy).toBe('');
    });

    it("previews today's date", () => {
      const { result } = setup();

      expect(result.current.dateLogged).toBe(
        new Date().toISOString().slice(0, 10),
      );
    });

    it('starts invalid, so the form cannot be submitted empty', () => {
      const { result } = setup();

      expect(result.current.isSubmittable).toBe(false);
    });

    it('does not submit an empty form', async () => {
      const { result } = setup();

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    // initialNote is only a way to seed valid values here, the mode is what
    // picks the create path.
    it('creates the note and reports success once the values are valid', async () => {
      const onDone = vi.fn();
      const { result } = setup({ initialNote: existingNote, onDone });

      await waitFor(() => expect(result.current.isSubmittable).toBe(true));
      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockCreate).toHaveBeenCalledWith({
        recResourceId: 'REC0019',
        title: 'Existing title',
        body: '<p>Existing body</p>',
      });
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(addSuccessNotification).toHaveBeenCalledWith(
        'Note saved successfully',
        'createNote-success',
      );
      expect(onDone).toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    const editSetup = (onDone?: () => void) =>
      setup({ mode: 'edit', initialNote: existingNote, onDone });

    it('takes the author and date from the note', () => {
      const { result } = editSetup();

      expect(result.current.createdBy).toBe('IDIR\\someone');
      expect(result.current.dateLogged).toBe('2026-01-02');
    });

    it('seeds the form from the note', () => {
      const { result } = editSetup();

      expect(result.current.watch('title')).toBe('Existing title');
      expect(result.current.watch('body')).toBe('<p>Existing body</p>');
    });

    it('is submittable because the seeded values are valid', async () => {
      const { result } = editSetup();

      await waitFor(() => expect(result.current.isSubmittable).toBe(true));
    });

    it('sends the note id on submit and reports success', async () => {
      const onDone = vi.fn();
      const { result } = editSetup(onDone);

      await waitFor(() => expect(result.current.isSubmittable).toBe(true));
      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        recResourceId: 'REC0019',
        noteId: 'n1',
        title: 'Existing title',
        body: '<p>Existing body</p>',
      });
      expect(addSuccessNotification).toHaveBeenCalledWith(
        'Note updated successfully',
        'updateNote-success',
      );
      expect(onDone).toHaveBeenCalled();
    });

    it('does nothing in edit mode without a note', async () => {
      const { result } = setup({ mode: 'edit' });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
