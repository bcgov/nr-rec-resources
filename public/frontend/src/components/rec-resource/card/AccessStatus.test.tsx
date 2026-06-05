import { render, screen } from '@testing-library/react';
import AccessStatus from './AccessStatus';

describe('AccessStatus', () => {
  it('renders the status description for status code 1', () => {
    render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders a decorative SVG for status code 1', () => {
    const { container } = render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the status description for status code 2', () => {
    render(
      <AccessStatus
        statusCode={2}
        statusDescription="Closed"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders a decorative SVG for status code 2', () => {
    const { container } = render(
      <AccessStatus
        statusCode={2}
        statusDescription="Closed"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('returns null for an unknown status code', () => {
    const { container } = render(
      <AccessStatus
        statusCode={99}
        statusDescription="Unknown"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render an advisory link when advisoryCount is 0', () => {
    render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the advisory link with the correct count and href', () => {
    render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={3}
        slug="REC123"
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('check advisories (3)');
    expect(link).toHaveAttribute('href', '/resource/REC123#know-before-you-go');
  });

  it('capitalises the advisory link text when hideComma is true', () => {
    render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={2}
        slug="REC123"
        hideComma
      />,
    );

    expect(screen.getByRole('link')).toHaveTextContent('Check advisories (2)');
  });

  it('lowercases the advisory link text and shows comma separator when hideComma is false', () => {
    const { container } = render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={2}
        slug="REC123"
        hideComma={false}
      />,
    );

    expect(screen.getByRole('link')).toHaveTextContent('check advisories (2)');
    expect(container.textContent).toContain(', ');
  });

  it('does not show a comma separator when hideComma is true', () => {
    const { container } = render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={2}
        slug="REC123"
        hideComma
      />,
    );

    expect(container.textContent).not.toContain(', ');
  });

  it('renders punctuation when provided', () => {
    const { container } = render(
      <AccessStatus
        statusCode={1}
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
        punctuation="."
      />,
    );

    expect(container.textContent).toContain('.');
  });
});
