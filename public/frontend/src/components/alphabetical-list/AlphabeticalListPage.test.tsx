import { render, screen } from '@/test-utils';
import AlphabeticalListPage from './AlphabeticalListPage';
import { vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams('?letter=A')],
  useNavigate: () => vi.fn(),
}));

vi.mock('@/components/layout/PageTitle', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="page-title">{title}</div>
  ),
}));

vi.mock('@shared/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
  useBreadcrumbs: () => {},
}));

vi.mock('@/components/alphabetical-list', () => ({
  AlphabeticalList: ({ selectedLetter, isLoading }: any) => (
    <div data-testid="alphabetical-list">
      {isLoading ? 'Loading...' : `Resources for ${selectedLetter}`}
    </div>
  ),
  AlphabeticalNavigation: ({ selectedLetter }: any) => (
    <div data-testid="alphabetical-navigation">
      Navigation for {selectedLetter}
    </div>
  ),
}));

vi.mock(
  '@/service/queries/recreation-resource/recreationResourceQueries',
  () => ({
    useAlphabeticalResources: () => ({
      data: [],
      isLoading: false,
    }),
  }),
);

describe('AlphabeticalListPage', () => {
  it('renders page title', () => {
    render(<AlphabeticalListPage />);
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
  });

  it('renders breadcrumbs', () => {
    render(<AlphabeticalListPage />);
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<AlphabeticalListPage />);
    expect(screen.getByText('A-Z list')).toBeInTheDocument();
  });

  it('renders alphabetical navigation', () => {
    render(<AlphabeticalListPage />);
    expect(screen.getByTestId('alphabetical-navigation')).toBeInTheDocument();
  });

  it('renders alphabetical list', () => {
    render(<AlphabeticalListPage />);
    expect(screen.getByTestId('alphabetical-list')).toBeInTheDocument();
  });

  it('passes selected letter to navigation and list', () => {
    render(<AlphabeticalListPage />);
    expect(screen.getByText('Navigation for A')).toBeInTheDocument();
    expect(screen.getByText('Resources for A')).toBeInTheDocument();
  });
});
