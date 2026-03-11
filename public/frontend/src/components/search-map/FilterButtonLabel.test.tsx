import { render, screen } from '@testing-library/react';
import FilterButtonLabel from './FilterButtonLabel';

describe('FilterButtonLabel', () => {
  it('renders "Filters" default label correctly when count is 0', () => {
    render(<FilterButtonLabel selectedFilterCount={0} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();

    // Check that the count badge is not rendered
    const countBadge = screen.queryByLabelText(/filters selected/i);
    expect(countBadge).not.toBeInTheDocument();
  });

  it('renders "Filters" label and the count badge correctly when count is > 0', () => {
    render(<FilterButtonLabel selectedFilterCount={3} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();

    const countBadge = screen.getByLabelText('3 filters selected');
    expect(countBadge).toBeInTheDocument();
    expect(countBadge).toHaveTextContent('3');
  });
});
