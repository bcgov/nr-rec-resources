import { RoleGuard } from '@/components/auth/RoleGuard';
import { render, screen } from '@testing-library/react';
import { createAuthWrapper } from '@test/routes/helpers/roleGuardTestHelper';
import { describe, expect, it } from 'vitest';

describe('RoleGuard', () => {
  it('renders children when user has the required role', () => {
    render(
      <RoleGuard requireAll={['rst-admin']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('hides children when user lacks the required role', () => {
    render(
      <RoleGuard requireAll={['rst-admin']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders fallback when role check fails', () => {
    render(
      <RoleGuard requireAll={['rst-admin']} fallback={<div>No access</div>}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('requires all roles in requireAll', () => {
    render(
      <RoleGuard requireAll={['rst-admin', 'rst-developer']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access with any matching requireAny role', () => {
    render(
      <RoleGuard requireAny={['rst-viewer', 'rst-admin']}>
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('requires both requireAll and requireAny conditions when both are provided', () => {
    render(
      <RoleGuard
        requireAll={['rst-developer']}
        requireAny={['rst-viewer', 'rst-admin']}
      >
        <div>Protected Content</div>
      </RoleGuard>,
      { wrapper: createAuthWrapper(['rst-developer']) },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
