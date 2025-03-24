import { render, screen } from '@testing-library/react';
import { RSTSVGLogo } from './RSTSVGLogo';
import '@testing-library/jest-dom';

vi.mock('@/images/BC_nav_logo.svg', () => ({ default: 'bc-logo-mock' }));
vi.mock('@/images/RST_nav_logo.svg', () => ({ default: 'rst-logo-mock' }));

describe('RSTSVGLogo', () => {
  it('renders both logos with correct alt text', () => {
    render(<RSTSVGLogo />);

    const bcLogo = screen.getByAltText('British Columbia Logo');
    expect(bcLogo).toBeInTheDocument();
    expect(bcLogo).toHaveAttribute('src', 'bc-logo-mock');

    const rstLogo = screen.getByAltText('Recreation Sites and Trails BC Logo');
    expect(rstLogo).toBeInTheDocument();
    expect(rstLogo).toHaveAttribute('src', 'rst-logo-mock');
  });
});
