import { LoadingOverlay } from '@shared/components/loading-overlay';
import { render, screen } from '@testing-library/react';

import { describe, it, expect } from 'vitest';

describe('LoadingOverlay', () => {
  it('renders nothing when not loading', () => {
    const { container } = render(
      <div data-testid="container">
        <LoadingOverlay isLoading={false} />
      </div>,
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('shows default spinner and message when loading', () => {
    render(<LoadingOverlay isLoading={true} message="Loading data..." />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('uses custom loader when provided', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        loader={<div data-testid="custom-loader">Custom Loader</div>}
      />,
    );

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('applies custom classes and z-index', () => {
    const { container } = render(
      <LoadingOverlay
        isLoading={true}
        className="custom-class"
        backdropClassName="bg-custom"
        positionClassName="position-fixed"
        zIndex={1000}
      />,
    );

    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass('bg-custom position-fixed custom-class');
    expect(overlay).toHaveStyle({ zIndex: 1000 });
  });

  it('uses custom spinner variant and size', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        spinnerVariant="primary"
        spinnerSize="2rem"
      />,
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('spinner-border text-primary');
    expect(spinner).toHaveStyle({ width: '2rem', height: '2rem' });
  });
});
