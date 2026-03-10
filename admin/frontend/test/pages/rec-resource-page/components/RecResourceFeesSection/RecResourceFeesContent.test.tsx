import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

vi.mock('@/components/auth', () => ({
  RoleGuard: ({ children }: any) => <>{children}</>,
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

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable',
  () => ({
    RecResourceFeesTable: ({ fees }: any) => (
      <div data-testid="fees-table">{fees.length} fees</div>
    ),
  }),
);

describe('RecResourceFeesContent', () => {
  beforeEach(() => {
    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
    });
  });

  it('renders Fees heading and table', () => {
    render(
      <RecResourceFeesContent
        fees={[{ fee_id: 1 } as any]}
        recResourceId="REC1"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Fees' })).toBeInTheDocument();
    expect(screen.getByTestId('fees-table')).toHaveTextContent('1 fees');
  });

  it('renders Add Fee link when recResourceId exists', () => {
    render(<RecResourceFeesContent fees={[]} recResourceId="REC999" />);

    const link = screen.getByRole('link', { name: /add fee/i });
    expect(link).toHaveAttribute('href', '/rec-resource/REC999/fees/add');
  });

  it('does not render Add Fee link when recResourceId is missing', () => {
    render(<RecResourceFeesContent fees={[]} />);
    expect(
      screen.queryByRole('link', { name: /add fee/i }),
    ).not.toBeInTheDocument();
  });
});
