import { render, screen, fireEvent } from '@testing-library/react';
import AlertBanner from '@/components/layout/AlertBanner';

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="font-awesome-icon" data-icon={icon.iconName} />
  ),
}));

describe('AlertBanner', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders nothing when the message is not set', () => {
    vi.stubEnv('VITE_ALERT_BANNER_MESSAGE', '');
    const { container } = render(<AlertBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the message is only whitespace', () => {
    vi.stubEnv('VITE_ALERT_BANNER_MESSAGE', '   ');
    const { container } = render(<AlertBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message with the alert icon', () => {
    vi.stubEnv('VITE_ALERT_BANNER_MESSAGE', 'Site maintenance tonight');
    render(<AlertBanner />);

    expect(
      screen.getByRole('region', { name: 'Site alert' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Site maintenance tonight')).toBeInTheDocument();
    const icons = screen.getAllByTestId('font-awesome-icon');
    expect(icons[0]).toHaveAttribute('data-icon', 'triangle-exclamation');
  });

  it('hides the banner when dismissed', () => {
    vi.stubEnv('VITE_ALERT_BANNER_MESSAGE', 'Site maintenance tonight');
    render(<AlertBanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }));

    expect(
      screen.queryByText('Site maintenance tonight'),
    ).not.toBeInTheDocument();
  });

  it('shows again on remount after being dismissed', () => {
    vi.stubEnv('VITE_ALERT_BANNER_MESSAGE', 'Site maintenance tonight');
    const { unmount } = render(<AlertBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }));
    unmount();

    render(<AlertBanner />);

    expect(screen.getByText('Site maintenance tonight')).toBeInTheDocument();
  });
});
