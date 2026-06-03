import { EditableGuard } from '@/components/auth/EditableGuard';
import { render, screen } from '@testing-library/react';
import { createAuthWrapper } from '@test/routes/helpers/roleGuardTestHelper';
import { describe, expect, it } from 'vitest';

describe('EditableGuard', () => {
  it('renders children when user has access and resource is not archived', () => {
    render(
      <EditableGuard requireAll={['rst-admin']} isArchived={false}>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.getByText('Edit action')).toBeInTheDocument();
  });

  it('hides children when resource is archived', () => {
    render(
      <EditableGuard requireAll={['rst-admin']} isArchived>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
  });

  it('hides children when role check fails', () => {
    render(
      <EditableGuard requireAll={['rst-admin']} isArchived={false}>
        <div>Edit action</div>
      </EditableGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
  });
});
