import { render, screen } from '@/test-utils';
import { AlphabeticalNavigation } from './AlphabeticalNavigation';

const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

describe('AlphabeticalNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);
    expect(screen.getByText('Select a letter:')).toBeInTheDocument();
  });

  it('renders all letters A-Z plus #', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    expect(screen.getByText('#')).toBeInTheDocument();

    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A-Z
      expect(screen.getByText(letter)).toBeInTheDocument();
    }
  });

  it('highlights the selected letter', () => {
    render(<AlphabeticalNavigation selectedLetter="M" />);

    const selectedButton = screen.getByText('M');
    expect(selectedButton).toHaveClass('active');
  });

  it('does not highlight non-selected letters', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    const nonSelectedButton = screen.getByText('Z');
    expect(nonSelectedButton).not.toHaveClass('active');
  });

  it('calls setSearchParams when letter button is clicked', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    const zButton = screen.getByText('Z');
    zButton.click();

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
    );
  });

  it('renders type filter buttons', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    expect(screen.getByText('Filter by type')).toBeInTheDocument();
    expect(screen.getByText('All types')).toBeInTheDocument();
    expect(screen.getByText('Recreation site')).toBeInTheDocument();
    expect(screen.getByText('Recreation trail')).toBeInTheDocument();
    expect(screen.getByText('Interpretive forest')).toBeInTheDocument();
  });

  it('highlights the selected type', () => {
    render(<AlphabeticalNavigation selectedLetter="A" selectedType="SIT" />);

    const selectedTypeButton = screen.getByText('Recreation site');
    expect(selectedTypeButton).toHaveClass('active');
  });

  it('highlights "All types" when no type is selected', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    const allTypesButton = screen.getByText('All types');
    expect(allTypesButton).toHaveClass('active');
  });

  it('calls setSearchParams when type button is clicked', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    const recreationSiteButton = screen.getByText('Recreation site');
    recreationSiteButton.click();

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
    );
  });
});
