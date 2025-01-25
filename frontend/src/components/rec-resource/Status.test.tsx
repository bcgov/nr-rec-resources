import { render, screen } from '@testing-library/react';
import Status from '@/components/rec-resource/Status';

describe('the Status component', () => {
  it('renders the blue status icon', async () => {
    render(<Status description="Open" statusCode="01" />);
    const statusElement = screen.getByAltText(/Site Open status icon/i);

    expect(statusElement).toBeInTheDocument();
  });

  it('renders the red status icon', async () => {
    render(<Status description="Closed" statusCode="02" />);
    const statusElement = screen.getByAltText(/Site Closed status icon/i);

    expect(statusElement).toBeInTheDocument();
  });

  it('does not render an icon for an unknown status code', async () => {
    render(<Status description="Unknown" statusCode="03" />);
    const statusElement = screen.queryByAltText(/Site Unknown status icon/i);

    expect(statusElement).not.toBeInTheDocument();
  });
});
