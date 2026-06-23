import { EditableGuard } from '@/components/auth/EditableGuard';
import { render, screen } from '@testing-library/react';
import { createAuthWrapper } from '@test/routes/helpers/roleGuardTestHelper';
import { describe, expect, it } from 'vitest';

describe('EditableGuard', () => {
  it('renders children when admin has access and resource is not archived', () => {
    render(
      <EditableGuard isArchived={false}>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.getByText('Edit action')).toBeInTheDocument();
  });

  it('hides children for admin when resource is archived', () => {
    render(
      <EditableGuard isArchived>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
  });

  it('hides children when viewer tries to edit a non-archived resource', () => {
    render(
      <EditableGuard isArchived={false}>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
  });

  it('renders children for super-admin when resource is archived', () => {
    render(
      <EditableGuard isArchived>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-super-admin']) },
    );

    expect(screen.getByText('Edit action')).toBeInTheDocument();
  });

  it('renders children for super-admin when resource is not archived', () => {
    render(
      <EditableGuard isArchived={false}>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-super-admin']) },
    );

    expect(screen.getByText('Edit action')).toBeInTheDocument();
  });

  it('renders fallback when role check fails', () => {
    render(
      <EditableGuard isArchived={false} fallback={<div>View-only</div>}>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
    expect(screen.getByText('View-only')).toBeInTheDocument();
  });
});
