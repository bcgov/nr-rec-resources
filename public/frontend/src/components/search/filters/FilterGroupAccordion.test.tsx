import { act, render, screen } from '@testing-library/react';
import FilterGroupAccordion from '@/components/search/filters/FilterGroupAccordion';
import FilterGroup from '@/components/search/filters/FilterGroup';
import { activitiesOptions } from '@/components/search/test/mock-data';

vi.mock('@tanstack/react-router', async () => {
  return {
    useSearch: vi.fn(() => ({})),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

describe('the FilterGroupAccordion component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderAccordion = (isOpen = false, onOpen = vi.fn()) =>
    render(
      <FilterGroupAccordion
        label="Activities"
        param="activities"
        isOpen={isOpen}
        onOpen={onOpen}
        tabIndex={0}
      >
        <FilterGroup
          options={activitiesOptions}
          param="activities"
          showMoreBtn={false}
        />
      </FilterGroupAccordion>,
    );

  it('renders a filter group with a label and options', () => {
    renderAccordion(true);

    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Snowmobiling (9)')).toBeVisible();
    expect(screen.getByText('Angling (14)')).toBeVisible();
    expect(screen.getByText('Canoeing (5)')).toBeVisible();
    expect(screen.getByText('Camping (12)')).toBeVisible();
  });

  it('should not check any options by default', () => {
    renderAccordion(true);

    activitiesOptions.forEach((option) => {
      const checkbox = screen.getByLabelText(
        `${option.description} (${option.count})`,
      );
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should check an option when clicked', () => {
    renderAccordion(true);

    const checkbox = screen.getByLabelText('Angling (14)');
    checkbox.click();
    expect(checkbox).toBeChecked();
  });

  it('should call onOpen with param when button is clicked', async () => {
    const onOpen = vi.fn();
    renderAccordion(false, onOpen);

    expect(screen.getByTestId('open-filter-group')).toBeVisible();

    const button = screen.getByRole('button', { name: 'Activities' });
    await act(async () => {
      button.click();
    });

    expect(onOpen).toHaveBeenCalledWith('activities');
  });

  it('should show close icon when isOpen is true', () => {
    renderAccordion(true);

    expect(screen.getByTestId('close-filter-group')).toBeVisible();
  });
});
