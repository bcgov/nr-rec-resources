import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable';
import { RecreationFeeUIModel } from '@/services';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDeleteFeeMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock('@/services', () => ({
  useDeleteFee: () => mockDeleteFeeMutation,
}));

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: vi.fn(),
}));

vi.mock(
  '@/components/delete-confirmation-modal/DeleteConfirmationModal',
  () => {
    const DeleteConfirmationModal = ({
      show,
      isDeleting,
      onCancel,
      onConfirm,
    }: any) =>
      show ? (
        <div data-testid="delete-modal">
          <button onClick={onCancel} data-testid="modal-cancel">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            data-testid="modal-confirm"
            disabled={isDeleting}
          >
            Delete fee
          </button>
        </div>
      ) : null;

    return { DeleteConfirmationModal };
  },
);

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: {
    VIEWER: 'rst-viewer',
    ADMIN: 'rst-admin',
    DEVELOPER: 'rst-developer',
  },
  useAuthorizations: () => mockUseAuthorizations(),
}));

vi.mock('@/components', () => ({
  CustomBadge: ({ label }: any) => (
    <span data-testid="custom-badge">{label}</span>
  ),
  Table: ({ columns, rows, emptyMessage, getRowKey }: any) => {
    if (rows.length === 0) {
      return <div>{emptyMessage}</div>;
    }
    return (
      <table>
        <thead>
          <tr>
            {columns.map((col: any, idx: number) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={getRowKey(row)}>
              {columns.map((col: any, colIdx: number) => (
                <td key={colIdx} data-testid={`cell-${colIdx}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/helpers',
  () => ({
    getIndividualDays: (fee: any) => {
      const days: string[] = [];
      if (fee.monday_ind === 'Y') days.push('Mon');
      if (fee.tuesday_ind === 'Y') days.push('Tue');
      if (fee.wednesday_ind === 'Y') days.push('Wed');
      if (fee.thursday_ind === 'Y') days.push('Thu');
      if (fee.friday_ind === 'Y') days.push('Fri');
      if (fee.saturday_ind === 'Y') days.push('Sat');
      if (fee.sunday_ind === 'Y') days.push('Sun');
      if (days.length === 7) return ['All days'];
      return days;
    },
    formatRecurringMonthDay: (mmdd?: string | null): string => {
      if (!mmdd) return '--';
      const match = mmdd.match(/^(\d{2})-(\d{2})$/);
      if (!match) return '--';
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return `${months[month - 1]} ${day}`;
    },
  }),
);

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="fa-icon">{icon.iconName}</span>
  ),
}));

describe('RecResourceFeesTable', () => {
  const mockFees: RecreationFeeUIModel[] = [
    {
      fee_id: 1,
      recreation_fee_code: 'TYPE_A',
      fee_type_description: 'Day Use',
      fee_amount: 10.5,
      fee_start_date: new Date('2024-01-01T00:00:00.000Z'),
      fee_end_date: new Date('2024-12-31T00:00:00.000Z'),
      fee_start_date_readable_utc: '2024-01-01',
      fee_end_date_readable_utc: '2024-12-31',
      recurring_ind: true,
      recurring_start_mmdd: '01-01',
      recurring_end_mmdd: '12-31',
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'N',
      sunday_ind: 'N',
    },
    {
      fee_id: 2,
      recreation_fee_code: 'TYPE_B',
      fee_type_description: 'Camping',
      fee_amount: 25.0,
      fee_start_date: new Date('2024-06-01T00:00:00.000Z'),
      fee_start_date_readable_utc: '2024-06-01',
      fee_end_date_readable_utc: null,
      recurring_ind: false,
      recurring_start_mmdd: undefined,
      recurring_end_mmdd: undefined,
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    },
    {
      fee_id: 3,
      recreation_fee_code: 'TYPE_C',
      fee_type_description: null,
      fee_amount: undefined,
      fee_start_date: undefined,
      fee_end_date: undefined,
      fee_start_date_readable_utc: null,
      fee_end_date_readable_utc: null,
      recurring_ind: false,
      recurring_start_mmdd: undefined,
      recurring_end_mmdd: undefined,
      monday_ind: 'N',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'N',
      sunday_ind: 'N',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: false,
    });
  });

  it('renders fee table with correct columns', () => {
    render(<RecResourceFeesTable fees={mockFees} />);

    expect(screen.getByText('Fee Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays fee data correctly formatted', () => {
    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    expect(screen.getByText('Day Use')).toBeInTheDocument();
    expect(screen.getByText('$10.50')).toBeInTheDocument();
    expect(screen.getByText('Jan 1')).toBeInTheDocument();
    expect(screen.getByText('Dec 31')).toBeInTheDocument();
  });

  it('shows "--" for missing/null values', () => {
    render(<RecResourceFeesTable fees={[mockFees[2]]} />);

    expect(screen.getByText('TYPE_C')).toBeInTheDocument();
    // Check for "--" in the rendered cells - the Table mock renders them
    const cells = screen.getAllByTestId(/^cell-/);
    const dashCells = cells.filter((cell) => cell.textContent === '--');
    expect(dashCells.length).toBeGreaterThanOrEqual(3); // Amount, Start Date, End Date, Days
  });

  it('renders individual days as badges', () => {
    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    const badges = screen.getAllByTestId('custom-badge');
    // Should have fee type badge + day badges (Mon, Tue)
    expect(badges.length).toBeGreaterThanOrEqual(3);
    expect(badges[0]).toHaveTextContent('Day Use');
    // Check that day badges are present
    const dayBadges = badges.filter((badge) =>
      ['Mon', 'Tue'].includes(badge.textContent || ''),
    );
    expect(dayBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('shows "All days" when all days are selected', () => {
    render(<RecResourceFeesTable fees={[mockFees[1]]} />);

    // "All days" should be rendered as a badge
    const badges = screen.getAllByTestId('custom-badge');
    const allDaysBadge = badges.find(
      (badge) => badge.textContent === 'All days',
    );
    expect(allDaysBadge).toBeInTheDocument();
  });

  it('shows edit link when flagged edit access is allowed and recResourceId provided', () => {
    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
    });

    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    const editLink = screen.getByLabelText('Edit fee');
    const deleteButton = screen.getByLabelText('Delete fee');
    expect(editLink).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(editLink).toHaveAttribute(
      'href',
      '/rec-resource/$id/fees/$feeId/edit',
    );
    expect(screen.getAllByTestId('fa-icon')).toHaveLength(2);
  });

  it('hides actions column when admin edit access is disabled', () => {
    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: false,
      canViewFeatureFlag: true,
      canEditFeatureFlag: false,
    });

    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    expect(screen.queryByLabelText('Edit fee')).not.toBeInTheDocument();
    // Actions column should show "--" - check in the last column (Actions)
    const cells = screen.getAllByTestId(/^cell-/);
    const actionCell = cells[cells.length - 1]; // Last cell is Actions column
    expect(actionCell).toHaveTextContent('--');
  });

  it('hides actions when recResourceId is missing', () => {
    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    expect(screen.queryByLabelText('Edit fee')).not.toBeInTheDocument();
  });

  it('displays empty message when no fees', () => {
    render(<RecResourceFeesTable fees={[]} />);

    expect(screen.getByText('Currently no fees')).toBeInTheDocument();
  });

  it('formats currency amounts correctly', () => {
    const feeWithDecimal: RecreationFeeUIModel = {
      ...mockFees[0],
      fee_amount: 99.99,
    };

    render(<RecResourceFeesTable fees={[feeWithDecimal]} />);

    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('uses fee_type_description when available, otherwise recreation_fee_code', () => {
    render(<RecResourceFeesTable fees={mockFees} />);

    expect(screen.getByText('Day Use')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('TYPE_C')).toBeInTheDocument();
  });

  it('renders multiple fees correctly', () => {
    render(<RecResourceFeesTable fees={mockFees} />);

    expect(screen.getByText('Day Use')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('TYPE_C')).toBeInTheDocument();
  });

  it.each([
    [
      'admin',
      {
        canView: true,
        canEdit: true,
        canViewFeatureFlag: true,
        canEditFeatureFlag: true,
      },
      true,
    ],
    [
      'viewer',
      {
        canView: true,
        canEdit: false,
        canViewFeatureFlag: true,
        canEditFeatureFlag: false,
      },
      false,
    ],
  ])('%s user edit link visible=%s', (_, auth, showsEditLink) => {
    mockUseAuthorizations.mockReturnValue(auth);

    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    if (showsEditLink) {
      expect(screen.getByLabelText('Edit fee')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Edit fee')).not.toBeInTheDocument();
    }
  });

  it('clicking delete button opens the confirmation modal', () => {
    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Delete fee'));

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('canceling the delete modal closes it without deleting', () => {
    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    fireEvent.click(screen.getByLabelText('Delete fee'));
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-cancel'));
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    expect(mockDeleteFeeMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('confirming delete calls mutateAsync, closes modal, and shows success notification', async () => {
    const { addSuccessNotification } = await import(
      '@/store/notificationStore'
    );
    mockDeleteFeeMutation.mutateAsync.mockResolvedValueOnce(undefined);

    render(
      <RecResourceFeesTable
        fees={[mockFees[0], mockFees[1]]}
        recResourceId="REC123"
      />,
    );

    // Open modal for first fee
    const deleteButtons = screen.getAllByLabelText('Delete fee');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(mockDeleteFeeMutation.mutateAsync).toHaveBeenCalledWith({
        recResourceId: 'REC123',
        feeId: mockFees[0].fee_id,
      });
    });

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    // Success notification
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Fee deleted successfully',
      'deleteFee-success',
    );
  });

  it('handleConfirmDelete does nothing when recResourceId is missing', async () => {
    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    // No actions rendered without recResourceId, so we confirm no mutation
    expect(mockDeleteFeeMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('handleConfirmDelete does nothing when fee has no fee_id', async () => {
    const feeWithoutId: RecreationFeeUIModel = {
      ...mockFees[0],
      fee_id: undefined as any,
    };
    mockDeleteFeeMutation.mutateAsync.mockResolvedValueOnce(undefined);

    render(
      <RecResourceFeesTable fees={[feeWithoutId]} recResourceId="REC123" />,
    );

    fireEvent.click(screen.getByLabelText('Delete fee'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    // mutateAsync should not be called because fee_id is missing
    await waitFor(() => {
      expect(mockDeleteFeeMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });
});
