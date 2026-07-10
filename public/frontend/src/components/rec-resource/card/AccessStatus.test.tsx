import { render, screen } from '@testing-library/react';
import AccessStatus from './AccessStatus';

describe('AccessStatus', () => {
  it('renders the status description for Open grouplabel', () => {
    render(
      <AccessStatus
        grouplabel="Open"
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders a decorative SVG for Open grouplabel', () => {
    const { container } = render(
      <AccessStatus
        grouplabel="Open"
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the status description for Closed grouplabel', () => {
    render(
      <AccessStatus
        grouplabel="Closed"
        statusDescription="Closed"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders a decorative SVG for Closed grouplabel', () => {
    const { container } = render(
      <AccessStatus
        grouplabel="Closed"
        statusDescription="Closed"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders Open status (blue icon) when no grouplabel is provided', () => {
    const { container } = render(
      <AccessStatus statusDescription="Open" advisoryCount={0} slug="REC123" />,
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders a yellow icon for Seasonal restrictions grouplabel', () => {
    const { container } = render(
      <AccessStatus
        grouplabel="Seasonal restrictions"
        statusDescription="Seasonal restrictions"
        advisoryCount={0}
        slug="REC123"
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Seasonal restrictions')).toBeInTheDocument();
  });

  it('does not render an advisory link when advisoryCount is 0', () => {
    render(
      <AccessStatus
        grouplabel="Open"
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
        grouplabel="Open"
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
        grouplabel="Open"
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
        grouplabel="Open"
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
        grouplabel="Open"
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
        grouplabel="Open"
        statusDescription="Open"
        advisoryCount={0}
        slug="REC123"
        punctuation="."
      />,
    );

    expect(container.textContent).toContain('.');
  });
});
