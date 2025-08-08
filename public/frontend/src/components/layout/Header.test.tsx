import { render, screen, within } from '@testing-library/react';
import Header from './Header';

describe('the Header component', () => {
  it('renders the component correctly', () => {
    render(<Header />);
    const findSiteLink = screen.getByText('Find a site or trail');
    expect(findSiteLink).toBeInTheDocument();
  });

  it('shows the "Share feedback" button for mobile inside main nav', () => {
    render(<Header />);

    const mainNav = screen.getByRole('navigation', {
      name: /main header navigation/i,
    });

    const feedbackButton = within(mainNav).getByRole('button', {
      name: /share your feedback/i,
    });

    expect(feedbackButton).toBeInTheDocument();
    expect(feedbackButton).toHaveClass('header-feedback-btn');
  });
});
