import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoRow from './InfoRow';

describe('InfoRow', () => {
  it('renders icon, title, and children', () => {
    render(
      <InfoRow icon="/icon.svg" iconAlt="Test icon" title="Test title">
        <p>Test content</p>
      </InfoRow>,
    );

    expect(screen.getByAltText('Test icon')).toBeInTheDocument();
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies optional className to the content column', () => {
    const { container } = render(
      <InfoRow
        icon="/icon.svg"
        iconAlt="Test icon"
        title="Test title"
        className="safety-item"
      >
        <p>Content</p>
      </InfoRow>,
    );

    expect(container.querySelector('.col-sm.safety-item')).toBeInTheDocument();
  });

  it('renders without a className when prop is omitted', () => {
    const { container } = render(
      <InfoRow icon="/icon.svg" iconAlt="Test icon" title="Test title">
        <p>Content</p>
      </InfoRow>,
    );

    const col = container.querySelector('.col-sm');
    expect(col).toBeInTheDocument();
    expect(col).not.toHaveClass('safety-item');
  });

  it('renders multiple children', () => {
    render(
      <InfoRow icon="/icon.svg" iconAlt="Test icon" title="Test title">
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </InfoRow>,
    );

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders children containing links', () => {
    render(
      <InfoRow icon="/icon.svg" iconAlt="Test icon" title="Test title">
        <p>
          See{' '}
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            example link
          </a>
          .
        </p>
      </InfoRow>,
    );

    expect(
      screen.getByRole('link', { name: 'example link' }),
    ).toBeInTheDocument();
  });
});
