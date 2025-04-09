import { render, screen } from '@testing-library/react';
import SiteDescription from '@/components/rec-resource/section/SiteDescription';

describe('SiteDescription Component', () => {
  it('should render the heading and site description', () => {
    render(<SiteDescription description="Test Description" />);

    expect(
      screen.getByRole('heading', { name: /site description/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should correctly parse html in the description', () => {
    render(<SiteDescription description="<span>Testing html parser</span>" />);

    expect(screen.getByText(/Testing/).textContent).toBe('Testing html parser');
  });

  it('should return null if no description or maintenance code is provided', () => {
    const { container } = render(
      <SiteDescription description="" maintenanceCode={undefined} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the user maintained description if provided', () => {
    render(<SiteDescription description="" maintenanceCode="U" />);

    expect(
      screen.getByRole('heading', { name: /maintenance type/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/limited maintenance services/i),
    ).toBeInTheDocument();
  });

  it('should render the maintained description if provided', () => {
    render(<SiteDescription description="" maintenanceCode="M" />);

    expect(
      screen.getByRole('heading', { name: /maintenance type/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/This site is maintained/)).toBeInTheDocument();
  });

  it('should not render the maintenance section if no maintenance code is provided', () => {
    const { container } = render(
      <SiteDescription description="Test Description" />,
    );

    expect(container).not.toHaveTextContent(/maintenance type/i);
  });

  it('should not render the maintenance section if an invalid maintenance code is provided', () => {
    const { container } = render(
      // @ts-ignore
      <SiteDescription description="Test Description" maintenanceCode="X" />,
    );

    expect(container).not.toHaveTextContent(/maintenance type/i);
  });
});
