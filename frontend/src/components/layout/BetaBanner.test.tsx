import { render, screen } from '@testing-library/react';
import BetaBanner from '@/components/layout/BetaBanner';
import useMediaQuery from '@/hooks/useMediaQuery';
import { vi } from 'vitest';

vi.mock('@/hooks/useMediaQuery');

describe('the BetaBanner component', () => {
  it('renders the desktop version correctly', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(<BetaBanner />);

    const desktopText = screen.getByText(/This site is in development/i);
    const feedbackButton = screen.getByText(/Submit your feedback/i);
    const originalSiteLink = screen.getByRole('link', {
      name: /original site here/i,
    });

    expect(desktopText).toBeInTheDocument();
    expect(feedbackButton).toBeInTheDocument();
    expect(originalSiteLink).toHaveAttribute(
      'href',
      'https://www.sitesandtrailsbc.ca',
    );
  });

  it('renders the mobile version correctly', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    render(<BetaBanner />);

    const mobileText = screen.getByText(/This site is in Beta/i);
    const feedbackButton = screen.getByText(/Give feedback/i);
    const originalSiteLink = screen.getByRole('link', {
      name: /Visit original site/i,
    });

    expect(mobileText).toBeInTheDocument();
    expect(feedbackButton).toBeInTheDocument();
    expect(originalSiteLink).toHaveAttribute(
      'href',
      'https://www.sitesandtrailsbc.ca',
    );
  });
});
