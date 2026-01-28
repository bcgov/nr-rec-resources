import { Route } from '@/routes/rec-resource/$id/reservation';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/pages/rec-resource-page/RecResourceReservationPage', () => ({
  RecResourceReservationPage: () => (
    <div data-testid="rec-resource-reservation-index-section">
      Reservation Features Page
    </div>
  ),
}));

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagRouteGuard: ({
    children,
    requiredFlags,
  }: {
    children: React.ReactNode;
    requiredFlags: string[];
  }) => (
    <div
      data-testid="feature-flag-route-guard"
      data-flags={requiredFlags.join(',')}
    >
      {children}
    </div>
  ),
}));

describe('RecResource Reservation Index Route', () => {
  it('should render component with FeatureFlagRouteGuard', () => {
    const Component = Route.options.component!;
    render(<Component />);
    const guard = screen.getByTestId('feature-flag-route-guard');
    expect(guard).toHaveAttribute('data-flags', 'enable_full_features');
    expect(guard).toContainElement(
      screen.getByTestId('rec-resource-reservation-index-section'),
    );
  });
});
