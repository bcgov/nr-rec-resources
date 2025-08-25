import { DropdownActionItem } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/DropdownActionItem';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { fireEvent, render, screen } from '@testing-library/react';
import { Dropdown } from 'react-bootstrap';
import { vi } from 'vitest';

// Helper wrapper for Dropdown context
const DropdownWrapper = ({ children }: { children: React.ReactNode }) => (
  <Dropdown show>
    <Dropdown.Toggle>Toggle</Dropdown.Toggle>
    <Dropdown.Menu>{children}</Dropdown.Menu>
  </Dropdown>
);

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
    render(
      <DropdownWrapper>
        <DropdownActionItem {...defaultProps} />
      </DropdownWrapper>,
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <DropdownWrapper>
        <DropdownActionItem {...defaultProps} onClick={onClick} />
      </DropdownWrapper>,
    );

    const dropdownItem = screen
      .getByText('Delete Item')
      .closest('.dropdown-item');
    fireEvent.click(dropdownItem!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders FontAwesome icon correctly', () => {
    render(
      <DropdownWrapper>
        <DropdownActionItem {...defaultProps} />
      </DropdownWrapper>,
    );

    // Check that SVG icon is rendered
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    render(
      <DropdownWrapper>
        <DropdownActionItem {...defaultProps} />
      </DropdownWrapper>,
    );

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

    render(
      <DropdownWrapper>
        <DropdownActionItem {...customProps} />
      </DropdownWrapper>,
    );

    expect(screen.getByText('Remove File')).toBeInTheDocument();
  });

  it('can be rendered multiple times in same dropdown', () => {
    render(
      <DropdownWrapper>
        <DropdownActionItem icon={faTrash} label="Item 1" onClick={vi.fn()} />
        <DropdownActionItem icon={faTrash} label="Item 2" onClick={vi.fn()} />
      </DropdownWrapper>,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('maintains Bootstrap dropdown styling', () => {
    render(
      <DropdownWrapper>
        <DropdownActionItem {...defaultProps} />
      </DropdownWrapper>,
    );

    const dropdownItem = document.querySelector('.dropdown-item');
    expect(dropdownItem).toHaveClass('dropdown-item');
  });
});
