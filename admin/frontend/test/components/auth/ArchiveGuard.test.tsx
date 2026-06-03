import { ArchiveGuard } from '@/components/auth/ArchiveGuard';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ArchiveGuard', () => {
  it('renders children when resource is not archived', () => {
    render(
      <ArchiveGuard isArchived={false}>
        <div>Editable content</div>
      </ArchiveGuard>,
    );

    expect(screen.getByText('Editable content')).toBeInTheDocument();
  });

  it('hides children when resource is archived', () => {
    render(
      <ArchiveGuard isArchived>
        <div>Editable content</div>
      </ArchiveGuard>,
    );

    expect(screen.queryByText('Editable content')).not.toBeInTheDocument();
  });

  it('renders fallback when archived', () => {
    render(
      <ArchiveGuard isArchived fallback={<div>Read-only</div>}>
        <div>Editable content</div>
      </ArchiveGuard>,
    );

    expect(screen.queryByText('Editable content')).not.toBeInTheDocument();
    expect(screen.getByText('Read-only')).toBeInTheDocument();
  });
});
