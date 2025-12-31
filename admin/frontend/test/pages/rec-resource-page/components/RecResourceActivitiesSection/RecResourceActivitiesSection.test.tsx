import { RecResourceActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/RecResourceActivitiesSection';
import { useParams } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ to, children, className }: any) => (
    <a href={to} className={className} data-testid="edit-link">
      {children}
    </a>
  ),
}));

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagGuard: ({ children, requiredFlags }: any) => (
    <div data-testid="feature-flag-guard" data-flags={requiredFlags.join(',')}>
      {children}
    </div>
  ),
}));

vi.mock('@shared/data/activityIconMap', () => ({
  activityIconMapFull: {
    '1': '/path/to/hiking-icon.svg',
    '2': '/path/to/camping-icon.svg',
  },
}));

describe('RecResourceActivitiesSection', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({
      id: 'test-resource-123',
    } as any);
  });

  it('renders section title', () => {
    render(<RecResourceActivitiesSection recreationActivities={[]} />);

    expect(screen.getByText('Activities')).toBeInTheDocument();
  });

  it('renders empty state when no activities', () => {
    render(<RecResourceActivitiesSection recreationActivities={[]} />);

    expect(screen.getByText('No activities assigned.')).toBeInTheDocument();
  });

  it('renders empty state when activities is null', () => {
    render(<RecResourceActivitiesSection recreationActivities={null as any} />);

    expect(screen.getByText('No activities assigned.')).toBeInTheDocument();
  });

  it('renders activities list with icons and descriptions', () => {
    const activities = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 2,
        description: 'Camping',
      },
    ];

    render(<RecResourceActivitiesSection recreationActivities={activities} />);

    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByAltText('Hiking icon')).toBeInTheDocument();
    expect(screen.getByAltText('Camping icon')).toBeInTheDocument();
  });

  it('renders activity without icon when icon is not available', () => {
    const activities = [
      {
        recreation_activity_code: 999,
        description: 'Unknown Activity',
      },
    ];

    render(<RecResourceActivitiesSection recreationActivities={activities} />);

    expect(screen.getByText('Unknown Activity')).toBeInTheDocument();
    expect(
      screen.queryByAltText('Unknown Activity icon'),
    ).not.toBeInTheDocument();
  });

  it('renders Edit button with FeatureFlagGuard when feature flag is enabled', () => {
    render(<RecResourceActivitiesSection recreationActivities={[]} />);

    const featureFlagGuard = screen.getByTestId('feature-flag-guard');
    expect(featureFlagGuard).toBeInTheDocument();
    expect(featureFlagGuard).toHaveAttribute(
      'data-flags',
      'enable_full_features',
    );

    const editLink = screen.getByTestId('edit-link');
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveTextContent('Edit');
    expect(editLink).toHaveAttribute(
      'href',
      '/rec-resource/$id/activities-features/edit',
    );
  });

  it('renders activities in grid layout', () => {
    const activities = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 2,
        description: 'Camping',
      },
    ];

    const { container } = render(
      <RecResourceActivitiesSection recreationActivities={activities} />,
    );

    const rows = container.querySelectorAll('.row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('uses correct resource ID in edit link params', () => {
    vi.mocked(useParams).mockReturnValue({
      id: 'custom-resource-id',
    } as any);

    render(<RecResourceActivitiesSection recreationActivities={[]} />);

    const editLink = screen.getByTestId('edit-link');
    expect(editLink).toBeInTheDocument();
  });

  it('handles activities with duplicate codes', () => {
    const activities = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
    ];

    render(<RecResourceActivitiesSection recreationActivities={activities} />);

    const hikingElements = screen.getAllByText('Hiking');
    expect(hikingElements.length).toBe(2);
  });
});
