import { ViewOnlyBanner } from '@/components/auth/ViewOnlyBanner';
import { createAuthWrapper } from '@test/routes/helpers/roleGuardTestHelper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ViewOnlyBanner', () => {
  it('shows banner for viewers (canView but not canEdit)', () => {
    render(<ViewOnlyBanner />, { wrapper: createAuthWrapper(['rst-viewer']) });

    expect(screen.getByText(/view-only access/i)).toBeInTheDocument();
  });

  it('hides banner for admins (canEdit)', () => {
    render(<ViewOnlyBanner />, { wrapper: createAuthWrapper(['rst-admin']) });

    expect(screen.queryByText(/view-only access/i)).not.toBeInTheDocument();
  });

  it('hides banner when user has no roles', () => {
    render(<ViewOnlyBanner />, { wrapper: createAuthWrapper([]) });

    expect(screen.queryByText(/view-only access/i)).not.toBeInTheDocument();
  });
});
