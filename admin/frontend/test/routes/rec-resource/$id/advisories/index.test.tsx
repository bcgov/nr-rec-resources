import { Route } from '@/routes/rec-resource/$id/advisories';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/pages/rec-resource-page/RecResourceAdvisoriesPage', () => ({
  RecResourceAdvisoriesPage: () => (
    <div data-testid="rec-resource-advisories-index-section">
      Advisories Page
    </div>
  ),
}));

const mockRoleRouteGuard = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);
vi.mock('@/components/auth', () => ({
  RoleRouteGuard: (props: {
    children: React.ReactNode;
    requireAll?: string[];
    requireAny: string[];
    redirectTo: string;
  }) => mockRoleRouteGuard(props),
}));

describe('RecResource Advisories Index Route', () => {
  it('renders component wrapped in RoleRouteGuard', () => {
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'REC123' } as any);

    const Component = Route.options.component!;
    render(<Component />);

    expect(
      screen.getByTestId('rec-resource-advisories-index-section'),
    ).toBeInTheDocument();
    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAny: ['rst-viewer', 'rst-admin'],
        redirectTo: '/rec-resource/REC123/files',
        children: expect.anything(),
      }),
    );
  });
});
