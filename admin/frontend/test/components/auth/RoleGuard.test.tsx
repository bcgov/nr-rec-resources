import { RoleGuard } from '@/components/auth/RoleGuard';
import { render, screen } from '@testing-library/react';
import { createAuthWrapper } from '@test/routes/helpers/roleGuardTestHelper';
import { describe, expect, it } from 'vitest';

describe('RoleGuard', () => {
  it('renders children when user has the required role', () => {
    render(
      <RoleGuard require={['rst-admin']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('hides children when user lacks the required role', () => {
    render(
      <RoleGuard require={['rst-admin']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders fallback when role check fails', () => {
    render(
      <RoleGuard require={['rst-admin']} fallback={<div>No access</div>}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('requires all roles when requireAll is true', () => {
    render(
      <RoleGuard require={['rst-admin', 'rst-developer']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access with any role when requireAll is false', () => {
    render(
      <RoleGuard require={['rst-viewer', 'rst-admin']} requireAll={false}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
