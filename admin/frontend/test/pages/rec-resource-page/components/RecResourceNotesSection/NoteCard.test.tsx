import { NoteCard } from '@/pages/rec-resource-page/components/RecResourceNotesSection/NoteCard';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span data-testid="icon" data-icon={icon?.iconName} {...props} />
  ),
}));

const baseNote: RecreationNoteDto = {
  note_id: 'n1',
  rec_resource_id: 'REC0019',
  note_type_code: 'NOTE',
  title: 'Access road washout',
  body: '<p>The last 2km washed out.</p>',
  date_logged: '2026-05-14',
  created_by: 'IDIR\\jdoe',
  is_editable: true,
};

describe('NoteCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthorizations.mockReturnValue({
      canEdit: true,
      isSuperAdmin: false,
    });
  });

  it('renders the title, body and metadata', () => {
    render(<NoteCard note={baseNote} />);

    expect(screen.getByText('Access road washout')).toBeInTheDocument();
    expect(screen.getByText('The last 2km washed out.')).toBeInTheDocument();
    expect(screen.getByText('IDIR\\jdoe')).toBeInTheDocument();
  });

  it('labels the note type', () => {
    render(<NoteCard note={baseNote} />);

    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('renders the body as markup rather than escaped text', () => {
    render(
      <NoteCard note={{ ...baseNote, body: '<p>a <strong>b</strong></p>' }} />,
    );

    expect(screen.getByText('b').tagName).toBe('STRONG');
  });

  it('strips dangerous markup from the body', () => {
    render(
      <NoteCard
        note={{ ...baseNote, body: '<p>safe</p><script>alert(1)</script>' }}
      />,
    );

    expect(screen.getByText('safe')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('shows no action buttons in the read-only view', () => {
    render(<NoteCard note={baseNote} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onEdit with the note', async () => {
    const onEdit = vi.fn();
    render(<NoteCard note={baseNote} onEdit={onEdit} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit note Access road washout' }),
    );

    expect(onEdit).toHaveBeenCalledWith(baseNote);
  });

  it('calls onRemove with the note', async () => {
    const onRemove = vi.fn();
    render(<NoteCard note={baseNote} onRemove={onRemove} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove note Access road washout' }),
    );

    expect(onRemove).toHaveBeenCalledWith(baseNote);
  });

  it('shows only the handler that was passed', () => {
    render(<NoteCard note={baseNote} onEdit={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /^Edit note/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Remove note/ }),
    ).not.toBeInTheDocument();
  });

  it('hides actions when the user cannot edit', () => {
    mockUseAuthorizations.mockReturnValue({
      canEdit: false,
      isSuperAdmin: false,
    });

    render(<NoteCard note={baseNote} onEdit={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('hides actions on an archived resource', () => {
    render(
      <NoteCard
        note={baseNote}
        isArchived
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps actions on an archived resource for a super admin', () => {
    mockUseAuthorizations.mockReturnValue({
      canEdit: true,
      isSuperAdmin: true,
    });

    render(<NoteCard note={baseNote} isArchived onEdit={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /^Edit note/ }),
    ).toBeInTheDocument();
  });
});
