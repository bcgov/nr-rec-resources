import { TrailsTable } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailsTable';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useDeleteTrail } from '@/services';
import { RecreationTrailDto } from '@/services/recreation-resource-admin/models';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuthorizations');
vi.mock('@/services', () => ({ useDeleteTrail: vi.fn() }));

// The TrailFormModal opened on edit is a child import — stub it out so it
// doesn't pull in the full form / query stack.
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailFormModal',
  () => ({
    TrailFormModal: ({ onClose }: { onClose: () => void }) => (
      <div data-testid="trail-form-modal">
        <button onClick={onClose}>Close modal</button>
      </div>
    ),
  }),
);

vi.mock('@/components', () => ({
  CustomBadge: ({ label }: { label: string }) => (
    <span data-testid="custom-badge">{label}</span>
  ),
  Table: ({ columns, rows, emptyMessage, getRowKey }: any) => (
    <div data-testid="table">
      {rows.length === 0 ? (
        <div>{emptyMessage}</div>
      ) : (
        rows.map((row: any, i: number) => (
          <div key={getRowKey ? getRowKey(row) : i} data-testid={`row-${i}`}>
            {columns.map((col: any, j: number) => (
              <div key={j} data-testid={`cell-${i}-${j}`}>
                {col.render(row)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  ),
}));

const mockTrailBlue: RecreationTrailDto = {
  recreation_activity_code_trails_id: 1,
  recreation_activity_code: 34,
  trail_type: 'BLUE' as any,
  name: 'Blue Trail',
  description: 'A blue trail',
};

const mockTrailNoType: RecreationTrailDto = {
  recreation_activity_code_trails_id: 2,
  recreation_activity_code: 34,
  trail_type: null,
  name: 'Unknown Trail',
};

const mockTrailUnknownType: RecreationTrailDto = {
  recreation_activity_code_trails_id: 3,
  recreation_activity_code: 34,
  trail_type: 'DIAMOND' as any,
  name: 'Diamond Trail',
};

describe('TrailsTable', () => {
  const mockMutateAsync = vi.fn();
  const defaultProps = { recResourceId: 'REC0001', activityCode: 34 };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteTrail).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  describe('as viewer (canEdit = false)', () => {
    beforeEach(() => {
      vi.mocked(useAuthorizations).mockReturnValue({ canEdit: false } as any);
    });

    it('renders trail names', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      expect(screen.getByText('Blue Trail')).toBeInTheDocument();
    });

    it('renders a badge for known trail types', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      expect(screen.getByTestId('custom-badge')).toHaveTextContent('Blue');
    });

    it('renders a dash in the difficulty column when trail_type is null', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailNoType]} />);
      // The difficulty cell is cell-0-1; the description cell is cell-0-2.
      // Both can show —, so scope to the difficulty cell.
      const difficultyCell = screen.getByTestId('cell-0-1');
      expect(difficultyCell).toHaveTextContent('—');
      expect(
        difficultyCell.querySelector('.text-secondary'),
      ).toBeInTheDocument();
    });

    it('falls back to raw trail_type string for unknown type', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailUnknownType]} />);
      expect(screen.getByTestId('custom-badge')).toHaveTextContent('DIAMOND');
    });

    it('renders description when present', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      expect(screen.getByText('A blue trail')).toBeInTheDocument();
    });

    it('renders dash when description is absent', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailNoType]} />);
      // description column for a trail with no description shows —
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });

    it('shows empty message when no trails', () => {
      render(<TrailsTable {...defaultProps} trails={[]} />);
      expect(screen.getByText('No trails added yet')).toBeInTheDocument();
    });

    it('does not render action buttons', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      expect(screen.queryByLabelText('Edit trail')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Delete trail')).not.toBeInTheDocument();
    });
  });

  describe('as admin (canEdit = true)', () => {
    beforeEach(() => {
      vi.mocked(useAuthorizations).mockReturnValue({ canEdit: true } as any);
    });

    it('renders edit and delete action buttons', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      expect(screen.getByLabelText('Edit trail')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete trail')).toBeInTheDocument();
    });

    it('opens edit modal when edit button is clicked', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      fireEvent.click(screen.getByLabelText('Edit trail'));
      expect(screen.getByTestId('trail-form-modal')).toBeInTheDocument();
    });

    it('closes edit modal when onClose is called', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      fireEvent.click(screen.getByLabelText('Edit trail'));
      fireEvent.click(screen.getByText('Close modal'));
      expect(screen.queryByTestId('trail-form-modal')).not.toBeInTheDocument();
    });

    it('shows confirmation UI on first delete click', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      fireEvent.click(screen.getByLabelText('Delete trail'));
      expect(screen.getByText('Delete?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('cancels delete confirmation when No is clicked', () => {
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      fireEvent.click(screen.getByLabelText('Delete trail'));
      fireEvent.click(screen.getByRole('button', { name: 'No' }));
      expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
    });

    it('calls deleteTrail when Yes is clicked after confirmation', async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);

      // First click: enter confirmation state
      fireEvent.click(screen.getByLabelText('Delete trail'));
      // Second click (Yes): perform delete
      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

      await vi.waitFor(() =>
        expect(mockMutateAsync).toHaveBeenCalledWith({
          recResourceId: 'REC0001',
          trailId: 1,
        }),
      );
    });

    it('disables Yes button while delete is pending', () => {
      vi.mocked(useDeleteTrail).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      } as any);

      render(<TrailsTable {...defaultProps} trails={[mockTrailBlue]} />);
      fireEvent.click(screen.getByLabelText('Delete trail'));
      expect(screen.getByRole('button', { name: 'Yes' })).toBeDisabled();
    });
  });
});
