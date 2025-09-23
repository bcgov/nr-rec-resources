import { render, screen } from '@/test-utils';
import { AlphabeticalNavigation } from './AlphabeticalNavigation';
import { ROUTE_PATHS } from '@/routes/constants';

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe('AlphabeticalNavigation', () => {
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

    const selectedLink = screen.getByText('M');
    expect(selectedLink).toHaveClass('active');
  });

  it('does not highlight non-selected letters', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    const nonSelectedLink = screen.getByText('Z');
    expect(nonSelectedLink).not.toHaveClass('active');
  });

  it('generates correct URLs for each letter', () => {
    render(<AlphabeticalNavigation selectedLetter="A" />);

    const aLink = screen.getByText('A');
    expect(aLink).toHaveAttribute(
      'href',
      `${ROUTE_PATHS.ALPHABETICAL}?letter=A`,
    );

    const zLink = screen.getByText('Z');
    expect(zLink).toHaveAttribute(
      'href',
      `${ROUTE_PATHS.ALPHABETICAL}?letter=Z`,
    );

    const hashLink = screen.getByText('#');
    expect(hashLink).toHaveAttribute(
      'href',
      `${ROUTE_PATHS.ALPHABETICAL}?letter=%23`,
    );
  });
});
