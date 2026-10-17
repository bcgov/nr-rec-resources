import { NotesEmptyState } from '@/pages/rec-resource-page/components/RecResourceNotesSection/NotesEmptyState';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('NotesEmptyState', () => {
  it('tells the user there is nothing yet', () => {
    render(<NotesEmptyState />);

    expect(
      screen.getByText('No notes or references have been added'),
    ).toBeInTheDocument();
  });
});
