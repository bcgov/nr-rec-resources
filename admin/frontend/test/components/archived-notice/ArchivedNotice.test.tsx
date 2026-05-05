import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ArchivedNotice,
  ARCHIVED_TITLE,
  ARCHIVED_MESSAGE,
} from '@/components/archived-notice/ArchivedNotice';

describe('ArchivedNotice', () => {
  it('displays the archived title', () => {
    render(<ArchivedNotice />);
    const title = screen.getByText(ARCHIVED_TITLE);
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('STRONG');
  });

  it('displays the archived message', () => {
    render(<ArchivedNotice />);
    const message = screen.getByText(ARCHIVED_MESSAGE);
    expect(message).toBeInTheDocument();
  });

  it('renders the info icon', () => {
    render(<ArchivedNotice />);
    const icon = screen.getByTestId('archived-icon');
    expect(icon).toBeInTheDocument();
  });
});
