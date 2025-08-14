import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';
import { MemoryRouter } from 'react-router-dom';

describe('the Footer component', () => {
  it('renders the component correctly', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const faceBookLink = screen.getByTitle(
      'Facebook BC Recreation Sites and Trails',
    );

    expect(faceBookLink).toBeInTheDocument();
  });
});
