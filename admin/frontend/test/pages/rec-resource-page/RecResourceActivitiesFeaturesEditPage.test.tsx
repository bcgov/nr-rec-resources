import { RecResourceActivitiesFeaturesEditPage } from '@/pages/rec-resource-page/RecResourceActivitiesFeaturesEditPage';
import { useLoaderData, useNavigate, useParams } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to} data-testid="cancel-link">
        {children}
      </a>
    ),
    useLoaderData: vi.fn(),
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

const mockActivitiesFormReturn = {
  control: {},
  errors: {},
  isDirty: false,
  updateMutation: { isPending: false },
  handleSubmit: vi.fn(() => vi.fn()),
  onSubmit: vi.fn(),
};

const mockFeaturesFormReturn = {
  control: {},
  errors: {},
  isDirty: false,
  updateMutation: { isPending: false },
  handleSubmit: vi.fn(() => vi.fn()),
  onSubmit: vi.fn(),
};

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitiesSection',
  () => ({
    RecResourceActivitiesEditSection: () => (
      <div data-testid="activities-edit-section">Activities Edit Section</div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeatureSection',
  () => ({
    RecResourceFeatureEditSection: () => (
      <div data-testid="features-edit-section">Features Edit Section</div>
    ),
    useEditFeaturesForm: () => mockFeaturesFormReturn,
    useFeatureOptions: () => ({
      options: [],
      isLoading: false,
    }),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useActivitiesOptions',
  () => ({
    useActivitiesOptions: () => ({
      options: [],
      isLoading: false,
    }),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useEditActivitiesForm',
  () => ({
    useEditActivitiesForm: () => mockActivitiesFormReturn,
  }),
);

describe('RecResourceActivitiesFeaturesEditPage', () => {
  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useLoaderData).mockReturnValue({
      activities: [],
      features: [],
    });
    vi.mocked(useParams).mockReturnValue({ id: 'test-123' });

    // Reset mock return values to defaults
    mockActivitiesFormReturn.isDirty = false;
    mockActivitiesFormReturn.updateMutation = { isPending: false };
    mockFeaturesFormReturn.isDirty = false;
    mockFeaturesFormReturn.updateMutation = { isPending: false };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders activities and features edit sections', () => {
    render(<RecResourceActivitiesFeaturesEditPage />);

    expect(screen.getByTestId('activities-edit-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-edit-section')).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<RecResourceActivitiesFeaturesEditPage />);

    expect(
      screen.getByRole('heading', { name: 'Activities' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Significant resource features' }),
    ).toBeInTheDocument();
  });

  it('renders Cancel link', () => {
    render(<RecResourceActivitiesFeaturesEditPage />);

    expect(screen.getByTestId('cancel-link')).toHaveTextContent('Cancel');
  });

  it('disables Save button when no changes', () => {
    render(<RecResourceActivitiesFeaturesEditPage />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables Save button when activities are dirty', () => {
    mockActivitiesFormReturn.isDirty = true;

    render(<RecResourceActivitiesFeaturesEditPage />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('enables Save button when features are dirty', () => {
    mockFeaturesFormReturn.isDirty = true;

    render(<RecResourceActivitiesFeaturesEditPage />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('disables Save button and shows Saving... while mutation is pending', () => {
    mockActivitiesFormReturn.isDirty = true;
    mockActivitiesFormReturn.updateMutation = { isPending: true };

    render(<RecResourceActivitiesFeaturesEditPage />);

    const saveButton = screen.getByRole('button', { name: 'Saving...' });
    expect(saveButton).toBeDisabled();
  });
});
