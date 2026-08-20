import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HelpIcon } from '@/components/help-icon/HelpIcon';

vi.mock('react-bootstrap', () => ({
  OverlayTrigger: ({ children, overlay, show, onToggle }: any) => (
    <div data-testid="mock-overlay-trigger" data-show={String(show)}>
      {show && <div data-testid="mock-overlay-container">{overlay}</div>}
      <div onClick={() => onToggle?.(!show)}>{children}</div>
    </div>
  ),
  Tooltip: ({ children, id, className }: any) => (
    <div role="tooltip" id={id} className={className}>
      {children}
    </div>
  ),
}));

describe('HelpIcon', () => {
  const defaultProps = { text: 'This is help text', id: 'test-help' };

  beforeEach(() => {
    cleanup();
  });

  it('does not show tooltip by default', () => {
    render(<HelpIcon {...defaultProps} />);
    expect(
      screen.queryByTestId('mock-overlay-container'),
    ).not.toBeInTheDocument();
  });

  it('shows tooltip when OverlayTrigger triggers onToggle with true', () => {
    render(<HelpIcon {...defaultProps} />);
    // Simulate toggle open by clicking the wrapper div
    fireEvent.click(screen.getByTestId('mock-overlay-trigger').firstChild!);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('badge click stops propagation (onClick fires without bubbling)', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <HelpIcon {...defaultProps} />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('badge mousedown stops propagation', () => {
    const parentMouseDown = vi.fn();
    render(
      <div onMouseDown={parentMouseDown}>
        <HelpIcon {...defaultProps} />
      </div>,
    );
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Help' }));
    expect(parentMouseDown).not.toHaveBeenCalled();
  });

  it('pressing Enter on the badge toggles the tooltip open', () => {
    render(<HelpIcon text="This is help text" id="test-help-enter" />);
    const badge = screen.getByRole('button', { name: 'Help' });
    fireEvent.keyDown(badge, { key: 'Enter' });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('pressing Space on the badge toggles the tooltip open', () => {
    render(<HelpIcon text="This is help text" id="test-help-space" />);
    const badge = screen.getByRole('button', { name: 'Help' });
    fireEvent.keyDown(badge, { key: ' ' });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('other keys do not toggle the tooltip', () => {
    render(<HelpIcon text="This is help text" id="test-help-other" />);
    const badge = screen.getByRole('button', { name: 'Help' });
    fireEvent.keyDown(badge, { key: 'Tab' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
