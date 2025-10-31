import { render, screen } from '@/test-utils';
import AlphabeticalListPage from './AlphabeticalListPage';
import { vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({ letter: 'A' }),
  useNavigate: () => vi.fn(),
  useMatches: () => [
    {
      context: {},
      loaderData: {},
    },
  ],
}));

vi.mock('@shared/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
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
