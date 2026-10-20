import { NoteForm } from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/NoteForm';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseNoteForm = vi.fn();
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/hooks/useNoteForm',
  () => ({
    useNoteForm: (args: unknown) => mockUseNoteForm(args),
  }),
);

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="icon" {...props} />,
}));

vi.mock('@/components/form', () => ({
  RichTextEditor: ({ label, maxLength }: any) => (
    <div data-testid="rich-text-editor" data-max={maxLength}>
      {label}
    </div>
  ),
}));

describe('NoteForm', () => {
  const onSubmit = vi.fn((e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
  });

  const hookResult = (overrides: Record<string, unknown> = {}) => ({
    control: {},
    register: () => ({ name: 'title' }),
    errors: {},
    watch: () => '',
    onSubmit,
    mutation: { isPending: false },
    createdBy: 'IDIR\\jdoe',
    dateLogged: '2026-05-14',
    isSubmittable: true,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNoteForm.mockReturnValue(hookResult());
  });

  const renderForm = (props: Record<string, unknown> = {}) =>
    render(
      <NoteForm
        recResourceId="REC0019"
        mode="create"
        onCancel={vi.fn()}
        {...(props as any)}
      />,
    );

  it('shows the server-stamped fields as read-only', () => {
    renderForm();

    const createdBy = screen.getByDisplayValue('IDIR\\jdoe');
    expect(createdBy).toBeDisabled();
    expect(screen.getByDisplayValue('2026-05-14')).toBeDisabled();
  });

  it('labels the submit button for create mode', () => {
    renderForm();

    expect(
      screen.getByRole('button', { name: 'Save note' }),
    ).toBeInTheDocument();
  });

  it('labels the submit button for edit mode', () => {
    renderForm({ mode: 'edit' });

    expect(
      screen.getByRole('button', { name: 'Update note' }),
    ).toBeInTheDocument();
  });

  it('shows a saving label while the mutation runs', () => {
    mockUseNoteForm.mockReturnValue(
      hookResult({ mutation: { isPending: true }, isSubmittable: false }),
    );

    renderForm();

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('disables submit until the form is valid', () => {
    mockUseNoteForm.mockReturnValue(hookResult({ isSubmittable: false }));

    renderForm();

    expect(screen.getByRole('button', { name: 'Save note' })).toBeDisabled();
  });

  it('counts the title characters', () => {
    mockUseNoteForm.mockReturnValue(hookResult({ watch: () => 'abcde' }));

    renderForm();

    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });

  it('counts an undefined title as zero', () => {
    mockUseNoteForm.mockReturnValue(hookResult({ watch: () => undefined }));

    renderForm();

    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('shows a title error from the form state', () => {
    mockUseNoteForm.mockReturnValue(
      hookResult({ errors: { title: { message: 'Title is required' } } }),
    );

    renderForm();

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('renders the body editor with the body limit', () => {
    renderForm();

    expect(screen.getByTestId('rich-text-editor')).toHaveAttribute(
      'data-max',
      '500',
    );
  });

  it('submits through the hook', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onCancel', async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('only shows delete when a handler is given', async () => {
    const onDelete = vi.fn();
    const { rerender } = renderForm();

    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();

    rerender(
      <NoteForm
        recResourceId="REC0019"
        mode="edit"
        onCancel={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalled();
  });
});
