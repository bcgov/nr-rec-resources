import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import Footer from '@/components/layout/Footer';

describe('the Footer component', () => {
  it('renders the component correctly', async () => {
    await renderWithRouter(<Footer />);

    // Check for Facebook link by href using query selector
    const faceBookLink = screen.getByRole('link', {
      name: (accessibleName, element) =>
        element.getAttribute('href') ===
        'https://www.facebook.com/BCRecSitesandTrails',
    });

    expect(faceBookLink).toBeInTheDocument();
    expect(faceBookLink).toHaveAttribute(
      'href',
      'https://www.facebook.com/BCRecSitesandTrails',
    );

    // Check for other important footer elements - find the logo by alt text
    expect(
      screen.getByAltText(/Recreation Sites and Trails BC Logo/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Contact us/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan your visit/i)).toBeInTheDocument();
  });
});
