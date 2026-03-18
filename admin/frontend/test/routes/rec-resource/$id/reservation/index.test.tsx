import { Route } from '@/routes/rec-resource/$id/reservation';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/pages/rec-resource-page/RecResourceReservationPage', () => ({
  RecResourceReservationPage: () => (
    <div data-testid="rec-resource-reservation-index-section">
      Reservation Features Page
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

describe('RecResource Reservation Index Route', () => {
  it('should render component with RoleRouteGuard', () => {
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'REC123' } as any);

    const Component = Route.options.component!;
    render(<Component />);
    expect(
      screen.getByTestId('rec-resource-reservation-index-section'),
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
