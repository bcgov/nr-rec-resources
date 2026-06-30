import { render, screen } from '@testing-library/react';
import Status from '@/components/rec-resource/Status';

describe('the Status component', () => {
  it('renders the blue status icon', async () => {
    render(<Status description="Open" statusCode={1} advisoriesCount={0} />);
    const statusElement = screen.getByAltText(/Site Open status icon/i);

    expect(statusElement).toBeInTheDocument();
  });

  it('renders the red status icon', async () => {
    render(<Status description="Closed" statusCode={2} advisoriesCount={0} />);
    const statusElement = screen.getByAltText(/Site Closed status icon/i);

    expect(statusElement).toBeInTheDocument();
  });

  it('does not render an icon for an unknown status code', async () => {
    render(<Status description="Unknown" statusCode={3} advisoriesCount={0} />);
    const statusElement = screen.queryByAltText(/Site Unknown status icon/i);

    expect(statusElement).not.toBeInTheDocument();
  });

  it('does not render advisories info if advisoriesCount equals 0', async () => {
    render(<Status description="Unknown" statusCode={1} advisoriesCount={0} />);
    const advisoriesElement = screen.queryByTestId('advisories-info-link');

    expect(advisoriesElement).not.toBeInTheDocument();
  });

  it('render advisories info if advisoriesCount greater than 0', async () => {
    render(<Status description="Unknown" statusCode={1} advisoriesCount={2} />);
    const advisoriesElement = screen.queryByTestId('advisories-info-link');

    expect(advisoriesElement).toBeInTheDocument();
  });
});
