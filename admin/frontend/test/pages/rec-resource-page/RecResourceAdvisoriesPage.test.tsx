import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourceAdvisoriesPage } from '@/pages/rec-resource-page/RecResourceAdvisoriesPage';
import { useRecResourceAdvisories } from '@/pages/rec-resource-page/hooks/useRecResourceAdvisories';
import { Route } from '@/routes/rec-resource/$id/advisories';

vi.mock('@/pages/rec-resource-page/hooks/useRecResourceAdvisories', () => ({
  useRecResourceAdvisories: vi.fn(),
}));

vi.mock('@/routes/rec-resource/$id/advisories', () => ({
  Route: { useParams: vi.fn() },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdvisoriesSection/RecResourceAdvisoriesSection',
  () => ({
    RecResourceAdvisoriesSection: ({ advisories }: any) => (
      <div data-testid="advisories-section">{advisories.length} advisories</div>
    ),
  }),
);

describe('RecResourceAdvisoriesPage', () => {
  const mockId = 'REC123';

  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(Route.useParams) as any).mockReturnValue({ id: mockId });
  });

  it('renders spinner when isLoading is true', () => {
    (vi.mocked(useRecResourceAdvisories) as any).mockReturnValue({
      advisories: undefined,
      isLoading: true,
      error: null,
    });

    render(<RecResourceAdvisoriesPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading advisories')).toBeInTheDocument();
  });

  it('returns null when there is an error', () => {
    (vi.mocked(useRecResourceAdvisories) as any).mockReturnValue({
      advisories: undefined,
      isLoading: false,
      error: new Error('Failed'),
    });

    const { container } = render(<RecResourceAdvisoriesPage />);

    expect(container.firstChild).toBeNull();
  });

  it('renders advisories section when data is loaded', () => {
    const mockAdvisories = [
      { advisory_number: 1001 },
      { advisory_number: 1002 },
    ];
    (vi.mocked(useRecResourceAdvisories) as any).mockReturnValue({
      advisories: mockAdvisories,
      isLoading: false,
      error: null,
    });

    render(<RecResourceAdvisoriesPage />);

    expect(screen.getByTestId('advisories-section')).toBeInTheDocument();
    expect(screen.getByText('2 advisories')).toBeInTheDocument();
  });

  it('renders section with empty array when advisories is undefined', () => {
    (vi.mocked(useRecResourceAdvisories) as any).mockReturnValue({
      advisories: undefined,
      isLoading: false,
      error: null,
    });

    render(<RecResourceAdvisoriesPage />);

    expect(screen.getByTestId('advisories-section')).toBeInTheDocument();
    expect(screen.getByText('0 advisories')).toBeInTheDocument();
  });

  it('passes rec resource id from route params to the hook', () => {
    (vi.mocked(useRecResourceAdvisories) as any).mockReturnValue({
      advisories: [],
      isLoading: false,
      error: null,
    });

    render(<RecResourceAdvisoriesPage />);

    expect(vi.mocked(useRecResourceAdvisories)).toHaveBeenCalledWith(mockId);
  });
});
