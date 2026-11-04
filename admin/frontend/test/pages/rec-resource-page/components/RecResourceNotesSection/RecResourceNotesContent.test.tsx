import { RecResourceNotesContent } from '@/pages/rec-resource-page/components/RecResourceNotesSection/RecResourceNotesContent';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection',
  () => ({
    NoteFormModal: ({ mode, recResourceId, onClose }: any) => (
      <div
        data-testid="note-form-modal"
        data-mode={mode}
        data-id={recResourceId}
      >
        <button onClick={onClose}>close modal</button>
      </div>
    ),
  }),
);

const makeNote = (id: string): RecreationNoteDto => ({
  note_id: id,
  rec_resource_id: 'REC0019',
  note_type_code: 'NOTE',
  title: `Title ${id}`,
  body: `<p>Body ${id}</p>`,
  date_logged: '2026-05-14',
  created_by: 'IDIR\\jdoe',
  is_editable: true,
});

describe('RecResourceNotesContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthorizations.mockReturnValue({
      canEdit: true,
      isSuperAdmin: false,
    });
  });

  it('renders the heading', () => {
    render(<RecResourceNotesContent notes={[]} />);

    expect(screen.getByText('Notes and references')).toBeInTheDocument();
  });

  it('shows the empty state with no notes', () => {
    render(<RecResourceNotesContent notes={[]} />);

    expect(
      screen.getByText('No notes or references have been added'),
    ).toBeInTheDocument();
  });

  it('renders a card per note', () => {
    render(
      <RecResourceNotesContent notes={[makeNote('n1'), makeNote('n2')]} />,
    );

    expect(screen.getByText('Title n1')).toBeInTheDocument();
    expect(screen.getByText('Title n2')).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    render(<RecResourceNotesContent notes={[]} isLoading />);

    expect(
      screen.getByRole('status', { name: 'Loading notes' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No notes or references have been added'),
    ).not.toBeInTheDocument();
  });

  it('hides the actions without a resource id', () => {
    render(<RecResourceNotesContent notes={[]} />);

    expect(
      screen.queryByRole('button', { name: 'Add note' }),
    ).not.toBeInTheDocument();
  });

  it('links to the edit page for the resource', () => {
    render(<RecResourceNotesContent notes={[]} recResourceId="REC0019" />);

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/rec-resource/REC0019/notes/edit',
    );
  });

  it('hides the actions when the user cannot edit', () => {
    mockUseAuthorizations.mockReturnValue({
      canEdit: false,
      isSuperAdmin: false,
    });

    render(<RecResourceNotesContent notes={[]} recResourceId="REC0019" />);

    expect(
      screen.queryByRole('button', { name: 'Add note' }),
    ).not.toBeInTheDocument();
  });

  it('opens the create modal from Add note', async () => {
    render(<RecResourceNotesContent notes={[]} recResourceId="REC0019" />);

    expect(screen.queryByTestId('note-form-modal')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add note' }));

    const modal = screen.getByTestId('note-form-modal');
    expect(modal).toHaveAttribute('data-mode', 'create');
    expect(modal).toHaveAttribute('data-id', 'REC0019');
  });

  it('closes the create modal again', async () => {
    render(<RecResourceNotesContent notes={[]} recResourceId="REC0019" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add note' }));
    await userEvent.click(screen.getByRole('button', { name: 'close modal' }));

    expect(screen.queryByTestId('note-form-modal')).not.toBeInTheDocument();
  });

  it('gives the read-only cards no per-card actions', () => {
    render(
      <RecResourceNotesContent
        notes={[makeNote('n1')]}
        recResourceId="REC0019"
      />,
    );

    expect(
      screen.queryByRole('button', { name: /^Edit note/ }),
    ).not.toBeInTheDocument();
  });
});
