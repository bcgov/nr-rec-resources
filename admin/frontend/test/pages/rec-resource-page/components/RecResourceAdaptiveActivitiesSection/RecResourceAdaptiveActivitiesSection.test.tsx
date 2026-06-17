import { RecResourceAdaptiveActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/RecResourceAdaptiveActivitiesSection';
import { RoleGuard } from '@/components/auth';
import { useParams } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to} data-testid="edit-link">
        {children}
      </a>
    ),
  };
});

vi.mock('@/components/auth', () => ({
  RoleGuard: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
}));

vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: { ADMIN: 'rst-admin' },
}));

vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    REC_RESOURCE_ACTIVITIES_FEATURES_EDIT:
      '/rec-resource/$id/activities-features/edit',
  },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/AdaptiveActivityList',
  () => ({
    AdaptiveActivityList: ({
      recreationActivities,
    }: {
      recreationActivities: any[];
    }) => (
      <div data-testid="adaptive-activity-list">
        {recreationActivities.length} activities
      </div>
    ),
  }),
);

describe('RecResourceAdaptiveActivitiesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: 'REC0001' } as any);
    vi.mocked(RoleGuard).mockImplementation(({ children }) => <>{children}</>);
  });

  it('renders the "Accessible activities" heading', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Accessible activities' }),
    ).toBeInTheDocument();
  });

  it('shows empty state message when recreationActivities is empty', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(
      screen.getByText('No accessible activities assigned.'),
    ).toBeInTheDocument();
  });

  it('does not render AdaptiveActivityList when activities list is empty', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(
      screen.queryByTestId('adaptive-activity-list'),
    ).not.toBeInTheDocument();
  });

  it('renders AdaptiveActivityList when activities are provided', () => {
    const activities = [
      {
        recreation_activity_code: 34,
        description: 'Adaptive Hiking',
        is_accessible: true,
      },
    ];

    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={activities as any}
      />,
    );

    expect(screen.getByTestId('adaptive-activity-list')).toBeInTheDocument();
    expect(screen.getByTestId('adaptive-activity-list')).toHaveTextContent(
      '1 activities',
    );
  });

  it('does not show empty state message when activities are provided', () => {
    const activities = [
      {
        recreation_activity_code: 34,
        description: 'Adaptive Hiking',
        is_accessible: true,
      },
    ];

    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={activities as any}
      />,
    );

    expect(
      screen.queryByText('No accessible activities assigned.'),
    ).not.toBeInTheDocument();
  });

  it('shows Edit link for admins (RoleGuard renders children)', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(screen.getByTestId('edit-link')).toHaveTextContent('Edit');
  });

  it('hides Edit link for viewers (RoleGuard renders nothing)', () => {
    vi.mocked(RoleGuard).mockImplementation(() => null);

    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(screen.queryByTestId('edit-link')).not.toBeInTheDocument();
  });

  it('Edit link href contains the resource id', () => {
    vi.mocked(useParams).mockReturnValue({ id: 'REC9999' } as any);

    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC9999"
        recreationActivities={[]}
      />,
    );

    expect(screen.getByTestId('edit-link')).toHaveAttribute(
      'href',
      expect.stringContaining('REC9999'),
    );
  });
});
