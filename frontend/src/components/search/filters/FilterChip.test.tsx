import { render, screen } from '@testing-library/react';
import { useFilterHandler } from '@/components/search/hooks/useFilterHandler';
import FilterChip from '@/components/search/filters/FilterChip';

vi.mock('@/components/search/hooks/useFilterHandler', () => ({
  useFilterHandler: vi.fn(() => ({
    toggleFilter: vi.fn(),
  })),
}));

describe('the FilterChips component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders a filter chip', () => {
    render(<FilterChip label="Snowmobiling" param="activities" id="1" />);

    expect(screen.getByText('Snowmobiling')).toBeVisible();
  });

  it('should call toggleFilter when clicked', () => {
    render(<FilterChip label="Snowmobiling" param="activities" id="1" />);

    const chip = screen.getByText('Snowmobiling');
    chip.click();
    expect(useFilterHandler).toHaveBeenCalled();
  });
});
