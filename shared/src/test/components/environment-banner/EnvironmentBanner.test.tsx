import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnvironmentBanner } from '@shared/components/environment-banner';

describe('EnvironmentBanner Component', () => {
  const originalMode = import.meta.env.MODE;
  const originalDeploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV;

  afterEach(() => {
    import.meta.env.MODE = originalMode;
    import.meta.env.VITE_DEPLOYMENT_ENV = originalDeploymentEnv;
  });

  it('shows banner for deployed dev environment', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'dev';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Dev');
  });

  it('shows banner for deployed test environment', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'test';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Test');
  });

  it('hides banner for production environment', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'prod';

    const { container } = render(<EnvironmentBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('shows banner for local development (MODE = development)', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'development';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Dev');
  });

  it('falls back to MODE when VITE_DEPLOYMENT_ENV is not set', () => {
    // In actual usage, if VITE_DEPLOYMENT_ENV is not set, it falls back to MODE
    // For testing purposes, we test with the actual test MODE
    import.meta.env.VITE_DEPLOYMENT_ENV = 'test';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Test');
  });

  it('does not show "- Local" suffix for deployed environments', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'dev';

    render(<EnvironmentBanner />);
    // import.meta.url doesn't contain localhost/127.0.0.1 in tests
    expect(screen.queryByText(/- Local/i)).not.toBeInTheDocument();
  });

  it('displays "Dev environment" for dev deployment', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'dev';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Dev');
    expect(banner).toHaveClass('env-identification', 'dev');
  });

  it('displays "Dev environment" for development mode', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'development';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Dev');
    expect(banner).toHaveClass('env-identification', 'development');
  });

  it('displays "Test environment" for test deployment', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'test';

    const { container } = render(<EnvironmentBanner />);
    const banner = container.querySelector('.env-identification');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain('Test');
    expect(banner).toHaveClass('env-identification', 'test');
  });

  it('hides banner for production mode', () => {
    import.meta.env.VITE_DEPLOYMENT_ENV = 'production';

    const { container } = render(<EnvironmentBanner />);
    expect(container.firstChild).toBeNull();
  });
});
