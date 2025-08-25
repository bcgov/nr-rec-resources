import { ActionButton } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/ActionButton';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

describe('ActionButton', () => {
  const defaultProps = {
    icon: faEye,
    label: 'Test Action',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct label and icon', () => {
    render(<ActionButton {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Test Action' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ActionButton {...defaultProps} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when stack container is clicked', () => {
    const onClick = vi.fn();
    render(<ActionButton {...defaultProps} onClick={onClick} />);

    const container = document.querySelector(
      '.gallery-file-card__action-button-container',
    );
    fireEvent.click(container!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<ActionButton {...defaultProps} />);

    const container = document.querySelector(
      '.gallery-file-card__action-button-container',
    );
    expect(container).toHaveAttribute('role', 'button');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('handles keyboard navigation - Enter key', () => {
    const onClick = vi.fn();
    render(<ActionButton {...defaultProps} onClick={onClick} />);

    const container = document.querySelector(
      '.gallery-file-card__action-button-container',
    );
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');
    container?.dispatchEvent(enterEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - Space key', () => {
    const onClick = vi.fn();
    render(<ActionButton {...defaultProps} onClick={onClick} />);

    const container = document.querySelector(
      '.gallery-file-card__action-button-container',
    );
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
    container?.dispatchEvent(spaceEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores other keyboard keys', () => {
    const onClick = vi.fn();
    render(<ActionButton {...defaultProps} onClick={onClick} />);

    const container = document.querySelector(
      '.gallery-file-card__action-button-container',
    );
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    container?.dispatchEvent(tabEvent);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders FontAwesome icon correctly', () => {
    render(<ActionButton {...defaultProps} />);

    // Check that SVG icon is rendered
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    render(<ActionButton {...defaultProps} />);

    const container = document.querySelector(
      '.gallery-file-card__action-button-container',
    );
    expect(container).toHaveClass('align-items-center');
    expect(container).toHaveClass('justify-content-center');
    expect(container).toHaveClass('gallery-file-card__action-button-container');

    const innerButton = container?.querySelector('.btn-link');
    expect(innerButton).toHaveClass('btn-link');
  });

  it('supports different icons and labels', () => {
    const customProps = {
      icon: faEye,
      label: 'Custom Label',
      onClick: vi.fn(),
    };

    render(<ActionButton {...customProps} />);

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Custom Label' }),
    ).toBeInTheDocument();
  });
});
