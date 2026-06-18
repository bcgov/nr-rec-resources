import { createRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import Fees from './Fees';
import { RecreationFeeModel } from '@/service/custom-models';
import { SectionTitles } from '@/components/rec-resource/enum';

vi.mock('./RecreationFee', () => ({
  default: vi.fn(
    ({
      data,
      campsite_count,
      expandAll,
      onAllExpandedChange,
    }: {
      data: RecreationFeeModel[];
      campsite_count?: number;
      expandAll?: boolean;
      onAllExpandedChange?: (allExpanded: boolean) => void;
    }) => (
      <div data-testid="recreation-fee">
        <span data-testid="fee-count">{data.length}</span>
        <span data-testid="fee-campsite-count">
          {campsite_count === undefined ? 'undefined' : String(campsite_count)}
        </span>
        <span data-testid="fee-expand-all">{String(expandAll)}</span>
        <button
          type="button"
          data-testid="trigger-all-expanded"
          onClick={() => onAllExpandedChange?.(true)}
        >
          trigger all expanded
        </button>
        <button
          type="button"
          data-testid="trigger-all-collapsed"
          onClick={() => onAllExpandedChange?.(false)}
        >
          trigger all collapsed
        </button>
      </div>
    ),
  ),
}));

const makeFee = (overrides: Partial<RecreationFeeModel> = {}) =>
  ({
    recreation_fee_code: 'O',
    recreation_fee_sub_code: 'C',
    fee_amount: 10,
    recurring_ind: false,
    ...overrides,
  }) as unknown as RecreationFeeModel;

const overnightFees: RecreationFeeModel[] = [
  makeFee({ recreation_fee_sub_code: 'C' }),
  makeFee({ recreation_fee_sub_code: 'CA' }),
];
const trailFees: RecreationFeeModel[] = [makeFee({ recreation_fee_code: 'T' })];
const additionalFees: RecreationFeeModel[] = [
  makeFee({ recreation_fee_code: 'D' }),
  makeFee({ recreation_fee_code: 'D' }),
  makeFee({ recreation_fee_code: 'D' }),
];

describe('Fees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no fee arrays contain any fees', () => {
    const { container } = render(<Fees id="fees" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when every fee array is explicitly empty', () => {
    const { container } = render(
      <Fees
        id="fees"
        overnight_fees={[]}
        trail_use_fees={[]}
        additional_fees={[]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the section heading, id and informational link when fees exist', () => {
    const { container } = render(
      <Fees id="fees" overnight_fees={overnightFees} />,
    );

    // Section heading + id
    expect(
      screen.getByRole('heading', { level: 2, name: SectionTitles.FEES }),
    ).toBeInTheDocument();
    expect(container.querySelector('#fees')).toBeInTheDocument();

    // Informational link
    const link = screen.getByRole('link', {
      name: /fees, discounts and reservations/i,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/fees',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders only the sections that have fees', () => {
    render(<Fees id="fees" trail_use_fees={trailFees} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Trail fees' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Overnight fees' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Additional fees' }),
    ).not.toBeInTheDocument();

    // One RecreationFee should be rendered.
    expect(screen.getAllByTestId('recreation-fee')).toHaveLength(1);
  });

  it('renders all three sections in order when every fee array has fees', () => {
    render(
      <Fees
        id="fees"
        overnight_fees={overnightFees}
        trail_use_fees={trailFees}
        additional_fees={additionalFees}
      />,
    );

    const sectionHeadings = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);

    expect(sectionHeadings).toEqual([
      'Overnight fees',
      'Trail fees',
      'Additional fees',
    ]);
    expect(screen.getAllByTestId('recreation-fee')).toHaveLength(3);
  });

  it('does not show the bulk toggle button when a section has only one fee', () => {
    render(<Fees id="fees" trail_use_fees={trailFees} />);

    expect(
      screen.queryByRole('button', { name: /expand trail fees/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /collapse trail fees/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the bulk toggle button when a section has more than one fee', () => {
    render(<Fees id="fees" overnight_fees={overnightFees} />);

    const toggle = screen.getByRole('button', {
      name: /expand overnight fees/i,
    });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('Expand all overnight fees');
  });

  it('toggles the bulk button label and forwards expandAll when clicked', () => {
    render(<Fees id="fees" overnight_fees={overnightFees} />);

    const toggle = screen.getByRole('button', {
      name: /expand overnight fees/i,
    });

    // Initially collapsed -> expandAll false is forwarded to RecreationFee.
    expect(screen.getByTestId('fee-expand-all')).toHaveTextContent('false');

    fireEvent.click(toggle);

    // After clicking, the button now says "Collapse" and expandAll = true.
    const collapseToggle = screen.getByRole('button', {
      name: /collapse overnight fees/i,
    });
    expect(collapseToggle).toHaveTextContent('Collapse all overnight fees');
    expect(screen.getByTestId('fee-expand-all')).toHaveTextContent('true');

    // Click again -> back to Expand.
    fireEvent.click(collapseToggle);
    expect(
      screen.getByRole('button', { name: /expand overnight fees/i }),
    ).toHaveTextContent('Expand all overnight fees');
    expect(screen.getByTestId('fee-expand-all')).toHaveTextContent('false');
  });

  it('keeps the chevron icon class in sync with the bulk toggle state', () => {
    const { container } = render(
      <Fees id="fees" overnight_fees={overnightFees} />,
    );

    expect(container.querySelector('.collapse-icon.collapsed')).not.toBeNull();
    expect(container.querySelector('.collapse-icon.expanded')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: /expand overnight fees/i }),
    );

    expect(container.querySelector('.collapse-icon.expanded')).not.toBeNull();
    expect(container.querySelector('.collapse-icon.collapsed')).toBeNull();
  });

  it('keeps each section\u2019s bulk toggle state independent', () => {
    render(
      <Fees
        id="fees"
        overnight_fees={overnightFees}
        additional_fees={additionalFees}
      />,
    );

    // Expand only the overnight section.
    fireEvent.click(
      screen.getByRole('button', { name: /expand overnight fees/i }),
    );

    // Overnight is expanded, additional is still collapsed.
    expect(
      screen.getByRole('button', { name: /collapse overnight fees/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /expand additional fees/i }),
    ).toBeInTheDocument();

    const feeInstances = screen.getAllByTestId('recreation-fee');
    expect(
      within(feeInstances[0]).getByTestId('fee-expand-all'),
    ).toHaveTextContent('true');
    expect(
      within(feeInstances[1]).getByTestId('fee-expand-all'),
    ).toHaveTextContent('false');
  });

  it('passes the campsite_count only to the overnight section', () => {
    render(
      <Fees
        id="fees"
        campsite_count={7}
        overnight_fees={overnightFees}
        trail_use_fees={trailFees}
        additional_fees={additionalFees}
      />,
    );

    const feeInstances = screen.getAllByTestId('recreation-fee');
    const campsiteCounts = feeInstances.map(
      (el) => within(el).getByTestId('fee-campsite-count').textContent,
    );
    expect(campsiteCounts).toEqual(['7', 'undefined', 'undefined']);
  });

  it('defaults the overnight campsite_count to 0 when the prop is omitted', () => {
    render(<Fees id="fees" overnight_fees={overnightFees} />);

    expect(screen.getByTestId('fee-campsite-count')).toHaveTextContent('0');
  });

  it('updates the bulk toggle label when RecreationFee reports all items expanded', () => {
    render(<Fees id="fees" overnight_fees={overnightFees} />);

    // Initially collapsed.
    expect(
      screen.getByRole('button', { name: /expand overnight fees/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-all-expanded'));

    expect(
      screen.getByRole('button', { name: /collapse overnight fees/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('fee-expand-all')).toHaveTextContent('true');

    fireEvent.click(screen.getByTestId('trigger-all-collapsed'));

    expect(
      screen.getByRole('button', { name: /expand overnight fees/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('fee-expand-all')).toHaveTextContent('false');
  });

  it('does not re-render when onAllExpandedChange reports the same state', () => {
    render(<Fees id="fees" overnight_fees={overnightFees} />);
    fireEvent.click(screen.getByTestId('trigger-all-collapsed'));

    expect(
      screen.getByRole('button', { name: /expand overnight fees/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('fee-expand-all')).toHaveTextContent('false');
  });

  it('forwards the ref to the underlying section element', () => {
    const ref = createRef<HTMLElement>();
    render(<Fees id="fees" overnight_fees={overnightFees} ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SECTION');
    expect(ref.current?.id).toBe('fees');
  });
});
