import { render, screen, fireEvent } from '@testing-library/react';
import FilterModal from '@/components/search/filters/FilterModal';
import '@testing-library/jest-dom';

describe('FilterModal', () => {
  const defaultParams = ['activity_type', 'status'];

  it('renders modal when open and shows content including footer', () => {
    render(
      <FilterModal isOpen={true} onClose={vi.fn()} params={defaultParams}>
        {() => (
          <>
            <div>Body Content</div>
            <div>Footer Content</div>
          </>
        )}
      </FilterModal>,
    );

    expect(screen.getByRole('heading', { name: 'Filter' })).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeVisible();
    expect(screen.getByText('Footer Content')).toBeVisible();
  });

  it('does not render modal content when closed', () => {
    render(
      <FilterModal isOpen={false} onClose={vi.fn()} params={defaultParams}>
        {() => (
          <>
            <div>Should Not Render</div>
            <div>Footer Should Not Render</div>
          </>
        )}
      </FilterModal>,
    );

    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Footer Should Not Render'),
    ).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <FilterModal isOpen={true} onClose={onClose} params={defaultParams}>
        {() => (
          <>
            <div>Body</div>
            <div>Footer</div>
          </>
        )}
      </FilterModal>,
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
