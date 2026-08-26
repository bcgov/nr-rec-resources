import {
  BulkAddModalLayout,
  BulkAssetPreviewRow,
  BulkCreationPreview,
  NumberStepperInput,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/BulkAddModalShared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('NumberStepperInput', () => {
  it('renders the label and current value', () => {
    render(<NumberStepperInput value={3} onChange={vi.fn()} />);
    expect(
      screen.getByText('How many do you want to add?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(3);
  });

  it('uses a custom label when provided', () => {
    render(
      <NumberStepperInput value={1} onChange={vi.fn()} label="Quantity" />,
    );
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('calls onChange with value - 1 when decrease button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberStepperInput value={3} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with value + 1 when increase button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberStepperInput value={3} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disables decrease button at min value', () => {
    render(<NumberStepperInput value={1} onChange={vi.fn()} min={1} />);
    expect(
      screen.getByRole('button', { name: 'Decrease quantity' }),
    ).toBeDisabled();
  });

  it('disables increase button at max value', () => {
    render(<NumberStepperInput value={100} onChange={vi.fn()} max={100} />);
    expect(
      screen.getByRole('button', { name: 'Increase quantity' }),
    ).toBeDisabled();
  });

  it('calls onChange when typing a number in the input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberStepperInput value={1} onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('5');

    expect(onChange).toHaveBeenLastCalledWith(5);
  });
});

describe('BulkCreationPreview', () => {
  it('renders the heading and children', () => {
    render(
      <BulkCreationPreview heading="Creating 2 assets">
        <div>Child content</div>
      </BulkCreationPreview>,
    );

    expect(screen.getByText('Creating 2 assets')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});

describe('BulkAssetPreviewRow', () => {
  it('renders the name and ID', () => {
    render(
      <BulkAssetPreviewRow name="Bridge 1" id="bridge-01-REC0001">
        <span>fields</span>
      </BulkAssetPreviewRow>,
    );

    expect(screen.getByText('Bridge 1')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <BulkAssetPreviewRow name="Bridge 1" id="bridge-01-REC0001">
        <span>My fields</span>
      </BulkAssetPreviewRow>,
    );

    expect(screen.getByText('My fields')).toBeInTheDocument();
  });

  it('renders a divider when showDivider is true', () => {
    const { container } = render(
      <BulkAssetPreviewRow name="Bridge 1" id="bridge-01-REC0001" showDivider>
        <span>fields</span>
      </BulkAssetPreviewRow>,
    );

    expect(
      container.querySelector('.bulk-modal__row-divider'),
    ).toBeInTheDocument();
  });

  it('does not render a divider when showDivider is false', () => {
    const { container } = render(
      <BulkAssetPreviewRow
        name="Bridge 1"
        id="bridge-01-REC0001"
        showDivider={false}
      >
        <span>fields</span>
      </BulkAssetPreviewRow>,
    );

    expect(
      container.querySelector('.bulk-modal__row-divider'),
    ).not.toBeInTheDocument();
  });
});

describe('BulkAddModalLayout', () => {
  const defaultProps = {
    show: true,
    title: 'Add assets',
    onHide: vi.fn(),
    submitLabel: 'Create 1 asset',
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renders the title and children when shown', () => {
    render(
      <BulkAddModalLayout {...defaultProps}>
        <p>Modal body content</p>
      </BulkAddModalLayout>,
    );

    expect(screen.getByText('Add assets')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('renders the submit button with the correct label', () => {
    render(
      <BulkAddModalLayout {...defaultProps}>
        <p>body</p>
      </BulkAddModalLayout>,
    );

    expect(
      screen.getByRole('button', { name: 'Create 1 asset' }),
    ).toBeInTheDocument();
  });

  it('disables the submit button when submitDisabled is true', () => {
    render(
      <BulkAddModalLayout {...defaultProps} submitDisabled>
        <p>body</p>
      </BulkAddModalLayout>,
    );

    expect(
      screen.getByRole('button', { name: 'Create 1 asset' }),
    ).toBeDisabled();
  });

  it('shows "Creating…" label and disables submit when isPending is true', () => {
    render(
      <BulkAddModalLayout {...defaultProps} isPending>
        <p>body</p>
      </BulkAddModalLayout>,
    );

    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <BulkAddModalLayout {...defaultProps} onCancel={onCancel}>
        <p>body</p>
      </BulkAddModalLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <BulkAddModalLayout {...defaultProps} onSubmit={onSubmit}>
        <p>body</p>
      </BulkAddModalLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Create 1 asset' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
