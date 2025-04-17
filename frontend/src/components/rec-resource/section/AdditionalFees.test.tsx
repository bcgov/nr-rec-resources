import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdditionalFees from './AdditionalFees';
import RecreationFee from './RecreationFee';

// Mock dependencies
vi.mock('./RecreationFee', () => ({
  default: vi.fn(() => <div data-testid="recreation-fee-mock" />),
}));

vi.mock('@/components/landing-page/components', () => ({
  SectionHeading: vi.fn(({ children }) => (
    <h2 data-testid="section-heading-mock">{children}</h2>
  )),
}));

describe('AdditionalFees', () => {
  const mockProps = {
    id: 'test-id',
    fees: [
      { id: 1, amount: 100 },
      { id: 2, amount: 200 },
    ],
  } as any;

  it('renders with required props', () => {
    render(<AdditionalFees {...mockProps} />);

    expect(screen.getByTestId('section-heading-mock')).toHaveTextContent(
      'Additional fees',
    );
    expect(screen.getByTestId('recreation-fee-mock')).toBeInTheDocument();
  });

  it('renders with empty fees array', () => {
    render(<AdditionalFees id="test-id" fees={[]} />);

    expect(screen.getByTestId('section-heading-mock')).toBeInTheDocument();
    expect(screen.getByTestId('recreation-fee-mock')).toBeInTheDocument();
  });

  it('passes fees data to RecreationFee component', () => {
    render(<AdditionalFees {...mockProps} />);

    const recreationFeeProps = vi.mocked(RecreationFee).mock.calls[0][0];
    expect(recreationFeeProps.data).toEqual(mockProps.fees);
  });

  it('sets correct id on section element', () => {
    const { container } = render(<AdditionalFees {...mockProps} />);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', mockProps.id);
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AdditionalFees {...mockProps} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
