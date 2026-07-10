import { render, screen } from '@testing-library/react';
import Status from '@/components/rec-resource/Status';

describe('the Status component', () => {
  it('renders the blue status icon for Open grouplabel', async () => {
    const { container } = render(
      <Status grouplabel="Open" description="Open" advisoriesCount={0} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders Open status with blue icon when no grouplabel is provided', async () => {
    const { container } = render(
      <Status description="Open" advisoriesCount={0} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders the red status icon for Closed grouplabel', async () => {
    const { container } = render(
      <Status grouplabel="Closed" description="Closed" advisoriesCount={0} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders the yellow status icon for Seasonal restrictions grouplabel', async () => {
    const { container } = render(
      <Status
        grouplabel="Seasonal restrictions"
        description="Seasonal restrictions"
        advisoriesCount={0}
      />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Seasonal restrictions')).toBeInTheDocument();
  });

  it('does not render advisories info if advisoriesCount equals 0', async () => {
    render(<Status description="Open" advisoriesCount={0} />);
    const advisoriesElement = screen.queryByTestId('advisories-info-link');

    expect(advisoriesElement).not.toBeInTheDocument();
  });

  it('renders advisories info if advisoriesCount greater than 0', async () => {
    render(<Status description="Open" advisoriesCount={2} />);
    const advisoriesElement = screen.queryByTestId('advisories-info-link');

    expect(advisoriesElement).toBeInTheDocument();
  });
});
