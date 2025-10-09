import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportMapFileBtn } from '@shared/components/recreation-resource-map';

describe('ExportMapFileBtn', () => {
  it('renders with correct text and icon', () => {
    const onClick = vi.fn();
    render(<ExportMapFileBtn onClick={onClick} />);

    expect(screen.getByText('Export map file')).toBeInTheDocument();
    expect(screen.getByAltText('Download map')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ExportMapFileBtn onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Export map file' });
    button.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
