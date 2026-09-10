import { DropdownActionItem } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/DropdownActionItem';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('DropdownActionItem', () => {
  const defaultProps = {
    icon: faTrash,
    label: 'Delete Item',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct label and icon', () => {
    render(<DropdownActionItem {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DropdownActionItem {...defaultProps} onClick={onClick} />);

    const dropdownItem = screen
      .getByText('Delete Item')
      .closest('.dropdown-item');
    await user.click(dropdownItem!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders FontAwesome icon correctly', () => {
    render(<DropdownActionItem {...defaultProps} />);

    // Check that SVG icon is rendered
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    render(<DropdownActionItem {...defaultProps} />);

    const stack = document.querySelector('.align-items-center');
    expect(stack).toBeInTheDocument();
    expect(stack).toHaveClass('align-items-center');

    const dropdownItem = document.querySelector('.dropdown-item');
    expect(dropdownItem).toBeInTheDocument();
  });

  it('supports different icons and labels', () => {
    const customProps = {
      icon: faTrash,
      label: 'Remove File',
      onClick: vi.fn(),
    };

    render(<DropdownActionItem {...customProps} />);

    expect(screen.getByText('Remove File')).toBeInTheDocument();
  });

  it('can be rendered multiple times in same dropdown', () => {
    render(
      <>
        <DropdownActionItem icon={faTrash} label="Item 1" onClick={vi.fn()} />
        <DropdownActionItem icon={faTrash} label="Item 2" onClick={vi.fn()} />
      </>,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('maintains Bootstrap dropdown styling', () => {
    render(<DropdownActionItem {...defaultProps} />);

    const dropdownItem = document.querySelector('.dropdown-item');
    expect(dropdownItem).toHaveClass('dropdown-item');
  });
});
