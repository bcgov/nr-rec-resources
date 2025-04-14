import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Camping from './Camping';
import RecreationFee from './RecreationFee';

// Mock dependencies
vi.mock('./RecreationFee', () => ({
  default: vi.fn(() => <div data-testid="recreation-fee" />),
}));

vi.mock('@/components/landing-page/components', () => ({
  SectionHeading: vi.fn(({ children }) => (
    <h2 data-testid="section-heading-mock">{children}</h2>
  )),
}));

describe('Camping Component', () => {
  const defaultProps = {
    id: 'camping-section',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders with minimal props', () => {
    render(<Camping {...defaultProps} />);
    expect(screen.getByTestId('section-heading-mock')).toHaveTextContent(
      'Camping',
    );
    expect(screen.queryByText('Number of campsites')).not.toBeInTheDocument();
    expect(screen.queryByTestId('recreation-fee')).not.toBeInTheDocument();
  });

  it('displays campsite count when greater than 0', () => {
    render(<Camping {...defaultProps} campsite_count={5} />);
    expect(screen.getByText('Number of campsites')).toBeInTheDocument();
    expect(screen.getByText('5 campsites')).toBeInTheDocument();
  });

  it('does not display campsite count when 0', () => {
    render(<Camping {...defaultProps} campsite_count={0} />);
    expect(screen.queryByText('Number of campsites')).not.toBeInTheDocument();
  });

  it('renders RecreationFee component when fees array is not empty', () => {
    const mockFees = [{ id: 1, amount: 10 }] as any;
    render(<Camping {...defaultProps} fees={mockFees} />);
    expect(screen.getByTestId('recreation-fee')).toBeInTheDocument();

    const recreationFeeProps = vi.mocked(RecreationFee).mock.calls[0][0];
    expect(recreationFeeProps.data).toEqual(mockFees);
  });

  it('does not render RecreationFee component when fees array is empty', () => {
    render(<Camping {...defaultProps} fees={[]} />);
    expect(RecreationFee).not.toHaveBeenCalled();
    expect(screen.queryByTestId('recreation-fee')).not.toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Camping {...defaultProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
