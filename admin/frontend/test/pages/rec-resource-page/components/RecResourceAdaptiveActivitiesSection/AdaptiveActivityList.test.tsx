import { AdaptiveActivityList } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/AdaptiveActivityList';
import { RoleGuard } from '@/components/auth';
import { useGetTrails } from '@/services';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services', () => ({ useGetTrails: vi.fn() }));

vi.mock('@/components/auth', () => ({
  RoleGuard: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
}));

vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: { ADMIN: 'rst-admin' },
}));

vi.mock('@shared/data/activityIconMap', () => ({
  activityIconMapFull: { '34': 'hiking-icon.svg' },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailFormModal',
  () => ({
    TrailFormModal: ({
      activityCode,
      mode,
      onClose,
    }: {
      activityCode: number;
      mode: string;
      onClose: () => void;
    }) => (
      <div data-testid="trail-form-modal">
        <span data-testid="modal-activity">{activityCode}</span>
        <span data-testid="modal-mode">{mode}</span>
        <button onClick={onClose}>Close modal</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailsTable',
  () => ({
    TrailsTable: ({
      activityCode,
      trails,
    }: {
      activityCode: number;
      trails: any[];
    }) => (
      <div data-testid={`trails-table-${activityCode}`}>
        {trails.length} trails
      </div>
    ),
  }),
);

const mockActivity34 = {
  recreation_activity_code: 34,
  description: 'Adaptive Hiking',
  is_accessible: true,
};

const mockActivity35 = {
  recreation_activity_code: 35,
  description: 'Adaptive Cycling',
  is_accessible: true,
};

const mockTrail34 = {
  recreation_activity_code_trails_id: 1,
  recreation_activity_code: 34,
  trail_type: 'BLUE' as any,
  name: 'Blue Trail',
};

const mockTrail35 = {
  recreation_activity_code_trails_id: 2,
  recreation_activity_code: 35,
  trail_type: 'GREEN' as any,
  name: 'Green Trail',
};

describe('AdaptiveActivityList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetTrails).mockReturnValue({ data: [] } as any);
    vi.mocked(RoleGuard).mockImplementation(({ children }) => <>{children}</>);
  });

  it('renders activity descriptions', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34, mockActivity35]}
      />,
    );

    expect(screen.getByText('Adaptive Hiking')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Cycling')).toBeInTheDocument();
  });

  it('renders an icon when activityIconMapFull has an entry for the activity code', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34]}
      />,
    );

    expect(screen.getByAltText('Adaptive Hiking icon')).toBeInTheDocument();
  });

  it('does not render an icon when no entry exists for the activity code', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity35]}
      />,
    );

    expect(
      screen.queryByAltText('Adaptive Cycling icon'),
    ).not.toBeInTheDocument();
  });

  it('renders a TrailsTable for each activity', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34, mockActivity35]}
      />,
    );

    expect(screen.getByTestId('trails-table-34')).toBeInTheDocument();
    expect(screen.getByTestId('trails-table-35')).toBeInTheDocument();
  });

  it('filters trails by activity code for each TrailsTable', () => {
    vi.mocked(useGetTrails).mockReturnValue({
      data: [mockTrail34, mockTrail35],
    } as any);

    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34, mockActivity35]}
      />,
    );

    expect(screen.getByTestId('trails-table-34')).toHaveTextContent('1 trails');
    expect(screen.getByTestId('trails-table-35')).toHaveTextContent('1 trails');
  });

  it('passes empty trails array when no trails match an activity', () => {
    vi.mocked(useGetTrails).mockReturnValue({
      data: [mockTrail34],
    } as any);

    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity35]}
      />,
    );

    expect(screen.getByTestId('trails-table-35')).toHaveTextContent('0 trails');
  });

  it('shows "+ Add trail" button when RoleGuard renders children (admin)', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34]}
      />,
    );

    expect(screen.getByText('+ Add trail')).toBeInTheDocument();
  });

  it('hides "+ Add trail" button when RoleGuard renders nothing (viewer)', () => {
    vi.mocked(RoleGuard).mockImplementation(() => null);

    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34]}
      />,
    );

    expect(screen.queryByText('+ Add trail')).not.toBeInTheDocument();
  });

  it('opens TrailFormModal with correct activityCode when "+ Add trail" is clicked', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34]}
      />,
    );

    fireEvent.click(screen.getByText('+ Add trail'));

    expect(screen.getByTestId('trail-form-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-activity')).toHaveTextContent('34');
    expect(screen.getByTestId('modal-mode')).toHaveTextContent('create');
  });

  it('closes TrailFormModal when onClose is called', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[mockActivity34]}
      />,
    );

    fireEvent.click(screen.getByText('+ Add trail'));
    expect(screen.getByTestId('trail-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close modal'));
    expect(screen.queryByTestId('trail-form-modal')).not.toBeInTheDocument();
  });

  it('renders nothing extra when recreationActivities is empty', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(screen.queryByText('+ Add trail')).not.toBeInTheDocument();
    expect(screen.queryByTestId(/trails-table/)).not.toBeInTheDocument();
  });

  it('calls useGetTrails with the correct recResourceId', () => {
    render(
      <AdaptiveActivityList
        recResourceId="REC9999"
        recreationActivities={[mockActivity34]}
      />,
    );

    expect(useGetTrails).toHaveBeenCalledWith('REC9999');
  });
});
