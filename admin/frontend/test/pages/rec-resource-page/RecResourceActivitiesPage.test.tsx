import { RecResourceActivitiesPage } from '@/pages/rec-resource-page/RecResourceActivitiesPage';
import { useLoaderData } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitiesSection',
  () => ({
    RecResourceActivitiesSection: ({ recreationActivities }: any) => (
      <div data-testid="rec-resource-activities-section">
        {recreationActivities?.length || 0} activities
      </div>
    ),
  }),
);

const mockActivities = [
  {
    recreation_activity_code: 1,
    description: 'Hiking',
  },
  {
    recreation_activity_code: 2,
    description: 'Camping',
  },
];

describe('RecResourceActivitiesPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders activities section when activities are loaded', () => {
    vi.mocked(useLoaderData).mockReturnValue({
      activities: mockActivities,
    } as any);

    render(<RecResourceActivitiesPage />);

    expect(
      screen.getByTestId('rec-resource-activities-section'),
    ).toBeInTheDocument();
    expect(screen.getByText('2 activities')).toBeInTheDocument();
  });

  it('renders activities section with empty activities array', () => {
    vi.mocked(useLoaderData).mockReturnValue({
      activities: [],
    } as any);

    render(<RecResourceActivitiesPage />);

    expect(
      screen.getByTestId('rec-resource-activities-section'),
    ).toBeInTheDocument();
    expect(screen.getByText('0 activities')).toBeInTheDocument();
  });
});
