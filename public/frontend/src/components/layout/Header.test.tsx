import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('the Header component', () => {
  it('renders the component correctly', () => {
    render(<Header />);

    const findSiteLink = screen.getByText('Find a site or trail');

    expect(findSiteLink).toBeInTheDocument();
  });
});
