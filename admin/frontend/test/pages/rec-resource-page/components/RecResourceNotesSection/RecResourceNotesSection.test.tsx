import { RecResourceNotesEditSection } from '@/pages/rec-resource-page/components/RecResourceNotesSection/RecResourceNotesEditSection';
import { RecResourceNotesSection } from '@/pages/rec-resource-page/components/RecResourceNotesSection/RecResourceNotesSection';
import { RecResourceNotesEditPage } from '@/pages/rec-resource-page/RecResourceNotesEditPage';
import { RecResourceNotesPage } from '@/pages/rec-resource-page/RecResourceNotesPage';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ id: 'REC0019' }),
}));

const mockUseRecResource = vi.fn();
vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: () => mockUseRecResource(),
}));

const mockUseGetNotes = vi.fn();
vi.mock('@/services/hooks/recreation-resource-admin/useGetNotes', () => ({
  useGetNotes: (id?: string) => mockUseGetNotes(id),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceNotesSection/RecResourceNotesContent',
  () => ({
    RecResourceNotesContent: (props: any) => (
      <div
        data-testid="notes-content"
        data-count={props.notes.length}
        data-id={props.recResourceId}
        data-archived={String(props.isArchived)}
        data-loading={String(props.isLoading)}
      />
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceNotesSection/RecResourceNotesEditContent',
  () => ({
    RecResourceNotesEditContent: (props: any) => (
      <div
        data-testid="notes-edit-content"
        data-count={props.notes.length}
        data-id={props.recResourceId}
        data-archived={String(props.isArchived)}
      />
    ),
  }),
);

const note = { note_id: 'n1' };

describe('RecResourceNotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'AC' },
    });
    mockUseGetNotes.mockReturnValue({ data: [note], isFetching: false });
  });

  it('passes the notes and resource id through', () => {
    render(<RecResourceNotesSection />);

    const content = screen.getByTestId('notes-content');
    expect(content).toHaveAttribute('data-count', '1');
    expect(content).toHaveAttribute('data-id', 'REC0019');
    expect(mockUseGetNotes).toHaveBeenCalledWith('REC0019');
  });

  it('marks an archived resource', () => {
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'AR' },
    });

    render(<RecResourceNotesSection />);

    expect(screen.getByTestId('notes-content')).toHaveAttribute(
      'data-archived',
      'true',
    );
  });

  it('tolerates a missing resource', () => {
    mockUseRecResource.mockReturnValue({ recResource: undefined });

    render(<RecResourceNotesSection />);

    expect(screen.getByTestId('notes-content')).toHaveAttribute(
      'data-archived',
      'false',
    );
  });

  it('defaults to an empty list', () => {
    mockUseGetNotes.mockReturnValue({ data: undefined, isFetching: false });

    render(<RecResourceNotesSection />);

    expect(screen.getByTestId('notes-content')).toHaveAttribute(
      'data-count',
      '0',
    );
  });

  it('only reports loading while the list is still empty', () => {
    mockUseGetNotes.mockReturnValue({ data: [], isFetching: true });

    render(<RecResourceNotesSection />);

    expect(screen.getByTestId('notes-content')).toHaveAttribute(
      'data-loading',
      'true',
    );
  });

  it('does not report loading on a background refetch', () => {
    mockUseGetNotes.mockReturnValue({ data: [note], isFetching: true });

    render(<RecResourceNotesSection />);

    expect(screen.getByTestId('notes-content')).toHaveAttribute(
      'data-loading',
      'false',
    );
  });
});

describe('RecResourceNotesEditSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'AC' },
    });
    mockUseGetNotes.mockReturnValue({ data: [note], isFetching: false });
  });

  it('passes the notes and resource id through', () => {
    render(<RecResourceNotesEditSection />);

    const content = screen.getByTestId('notes-edit-content');
    expect(content).toHaveAttribute('data-count', '1');
    expect(content).toHaveAttribute('data-id', 'REC0019');
  });

  it('marks an archived resource', () => {
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'AR' },
    });

    render(<RecResourceNotesEditSection />);

    expect(screen.getByTestId('notes-edit-content')).toHaveAttribute(
      'data-archived',
      'true',
    );
  });

  it('defaults to an empty list', () => {
    mockUseGetNotes.mockReturnValue({ data: undefined, isFetching: false });

    render(<RecResourceNotesEditSection />);

    expect(screen.getByTestId('notes-edit-content')).toHaveAttribute(
      'data-count',
      '0',
    );
  });
});

describe('notes pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'AC' },
    });
    mockUseGetNotes.mockReturnValue({ data: [], isFetching: false });
  });

  it('RecResourceNotesPage renders the read-only section', () => {
    render(<RecResourceNotesPage />);

    expect(screen.getByTestId('notes-content')).toBeInTheDocument();
  });

  it('RecResourceNotesEditPage renders the edit section', () => {
    render(<RecResourceNotesEditPage />);

    expect(screen.getByTestId('notes-edit-content')).toBeInTheDocument();
  });
});
