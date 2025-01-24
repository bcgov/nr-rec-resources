import { render, screen } from '@testing-library/react';
import Closures from '@/components/rec-resource/Closures';

describe('the Closures component', () => {
  it('renders the site name', async () => {
    render(<Closures comment="This site is closed" siteName="Site Name" />);
    const siteNameElement = screen.getByText('Site Name');

    expect(siteNameElement).toBeInTheDocument();
  });

  it('renders the closure comment', async () => {
    render(<Closures comment="This site is closed" siteName="Site Name" />);
    const commentElement = screen.getByText('This site is closed');

    expect(commentElement).toBeInTheDocument();
  });

  it('does not render if there is no comment', async () => {
    render(<Closures comment="" siteName="Site Name" />);
    const commentElement = screen.queryByText('This site is closed');

    expect(commentElement).not.toBeInTheDocument();
  });

  it('does not render if there is no site name', async () => {
    render(<Closures comment="This site is closed" siteName="" />);
    const siteNameElement = screen.queryByText('Site Name');

    expect(siteNameElement).not.toBeInTheDocument();
  });
});
