import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadTile } from '@/pages/rec-resource-page/components/RecResourceFileSection/FileUploadTile';

describe('FileUploadTile', () => {
  const renderTile = (props = {}) =>
    render(<FileUploadTile label="Upload" {...props} />);

  it('renders upload tile with label', () => {
    renderTile();
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
    expect(screen.getByTestId('upload-tile')).toBeInTheDocument();
  });

  it.each([
    [false, true],
    [true, false],
  ])(
    'calls onClick only if not disabled (disabled=%s)',
    (disabled, shouldCall) => {
      const onClick = vi.fn();
      renderTile({ onClick, disabled });
      fireEvent.click(screen.getByTestId('upload-tile'));
      if (shouldCall) expect(onClick).toHaveBeenCalled();
      else expect(onClick).not.toHaveBeenCalled();
    },
  );

  it('shows disabled class when disabled', () => {
    renderTile({ disabled: true });
    expect(screen.getByTestId('upload-tile')).toHaveClass('disabled');
  });

  it('calls onFileDrop with the dropped file', () => {
    const onFileDrop = vi.fn();
    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    renderTile({ onFileDrop });
    const tile = screen.getByTestId('upload-tile');

    fireEvent.dragEnter(tile, { dataTransfer: { files: [file] } });
    fireEvent.drop(tile, { dataTransfer: { files: [file] } });

    expect(onFileDrop).toHaveBeenCalledWith(file);
  });

  it('shows active state while dragging and clears on leave', () => {
    renderTile({ onFileDrop: vi.fn() });
    const tile = screen.getByTestId('upload-tile');

    fireEvent.dragEnter(tile, { dataTransfer: { files: [] } });
    expect(tile).toHaveClass('active');

    fireEvent.dragLeave(tile, { dataTransfer: { files: [] } });
    expect(tile).not.toHaveClass('active');
  });

  it('does not call onFileDrop when disabled', () => {
    const onFileDrop = vi.fn();
    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    renderTile({ onFileDrop, disabled: true });

    fireEvent.drop(screen.getByTestId('upload-tile'), {
      dataTransfer: { files: [file] },
    });

    expect(onFileDrop).not.toHaveBeenCalled();
  });
});
