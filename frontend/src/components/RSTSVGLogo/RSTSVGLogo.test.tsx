import { render, screen } from '@testing-library/react';
import { RSTSVGLogo } from './RSTSVGLogo';
import '@testing-library/jest-dom';

vi.mock('@/images/RST_nav_logo.svg', () => ({ default: 'rst-logo-mock' }));

describe('RSTSVGLogo', () => {
  it('renders the logo with correct alt text', () => {
    render(<RSTSVGLogo />);

    const rstLogo = screen.getByAltText('Recreation Sites and Trails BC Logo');
    expect(rstLogo).toBeInTheDocument();
    expect(rstLogo).toHaveAttribute('src', 'rst-logo-mock');
  });
});
