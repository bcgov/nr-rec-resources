import { render, screen } from '@testing-library/react';
import { FileStatusBadge } from '@/components/file-status-badge/FileStatusBadge';
import {
  COLOR_BACKGROUND_GREY,
  COLOR_GREY,
  COLOR_RED,
  COLOR_RED_LIGHT,
} from '@/styles/colors';
import { describe, expect, it } from 'vitest';

describe('FileStatusBadge', () => {
  it('renders nothing when there is no status code', () => {
    const { container, rerender } = render(<FileStatusBadge code={null} />);

    expect(container).toBeEmptyDOMElement();

    rerender(<FileStatusBadge code={undefined} label="Archived" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders mapped badge colors and the provided label for known status codes', () => {
    render(<FileStatusBadge code="AR" label="Archived" />);

    const badge = screen.getByText('Archived');

    expect(badge).toHaveStyle({
      backgroundColor: COLOR_RED_LIGHT,
      color: COLOR_RED,
    });
  });

  it('falls back to the code label and default colors for unknown status codes', () => {
    render(<FileStatusBadge code="ZZ" />);

    const badge = screen.getByText('ZZ');

    expect(badge).toHaveStyle({
      backgroundColor: COLOR_BACKGROUND_GREY,
      color: COLOR_GREY,
    });
  });
});
