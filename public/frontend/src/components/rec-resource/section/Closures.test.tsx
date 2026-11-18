import { render, screen } from '@testing-library/react';
import Closures from '@/components/rec-resource/section/Closures';

describe('the Closures component', () => {
  it('renders the site name', async () => {
    render(
      <Closures
        title="Wildfire closure"
        grouplabel="Closed"
        siteName="Site Name"
      />,
    );
    const siteNameElement = screen.getByText('Site Name');

    expect(siteNameElement).toBeInTheDocument();
  });

  it('renders the advisory title', async () => {
    render(
      <Closures
        title="Wildfire closure"
        grouplabel="Closed"
        siteName="Site Name"
      />,
    );
    const titleElement = screen.getByText('Wildfire closure');

    expect(titleElement).toBeInTheDocument();
  });

  it('describes the site with the advisory status', async () => {
    render(
      <Closures
        title="Bridge out"
        grouplabel="Restricted"
        siteName="Site Name"
      />,
    );

    expect(screen.getByText(/is restricted/)).toBeInTheDocument();
  });

  it('does not render if there is no title', async () => {
    render(<Closures title="" grouplabel="Closed" siteName="Site Name" />);
    const siteNameElement = screen.queryByText('Site Name');

    expect(siteNameElement).not.toBeInTheDocument();
  });

  it('does not render if there is no site name', async () => {
    render(
      <Closures title="Wildfire closure" grouplabel="Closed" siteName="" />,
    );
    const titleElement = screen.queryByText('Wildfire closure');

    expect(titleElement).not.toBeInTheDocument();
  });
});
