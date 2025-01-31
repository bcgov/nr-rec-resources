import { act, render, screen } from '@testing-library/react';
import FilterGroupMobile from '@/components/search/filters/FilterGroupMobile';
import { activitiesOptions } from '@/components/search/filters/FilterMenu.test';

vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]), // Default empty params
  };
});

describe('the FilterGroupMobile component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders a filter group with a label and options', () => {
    render(
      <FilterGroupMobile
        label="Activities"
        options={activitiesOptions}
        param="activities"
        isOpen={false}
        onOpen={vi.fn()}
        tabIndex={0}
      />,
    );

    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Snowmobiling (9)')).toBeVisible();
    expect(screen.getByText('Angling (14)')).toBeVisible();
    expect(screen.getByText('Canoeing (5)')).toBeVisible();
    expect(screen.getByText('Camping (12)')).toBeVisible();
  });

  it('should not check any options by default', () => {
    render(
      <FilterGroupMobile
        label="Activities"
        options={activitiesOptions}
        param="activities"
        isOpen={false}
        onOpen={vi.fn()}
        tabIndex={0}
      />,
    );

    activitiesOptions.forEach((option) => {
      const checkbox = screen.getByLabelText(
        `${option.description} (${option.count})`,
      );
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should check an option when clicked', () => {
    render(
      <FilterGroupMobile
        label="Activities"
        options={activitiesOptions}
        param="activities"
        isOpen={false}
        onOpen={vi.fn()}
        tabIndex={0}
      />,
    );
    const checkbox = screen.getByLabelText('Angling (14)');
    checkbox.click();
    expect(checkbox).toBeChecked();
  });

  it('should open the filter group when isOpen changes', async () => {
    const onOpen = vi.fn();
    render(
      <FilterGroupMobile
        label="Things to do"
        options={activitiesOptions}
        param="activities"
        isOpen={false}
        onOpen={onOpen}
        tabIndex={0}
      />,
    );

    expect(screen.getByTestId('open-filter-group')).toBeVisible();

    const openButton = screen.getByRole('button', {
      name: 'Things to do',
    });
    await act(async () => {
      openButton.click();
    });

    // isOpen is handled by the parent component so re-render here
    render(
      <FilterGroupMobile
        label="Things to do"
        options={activitiesOptions}
        param="activities"
        isOpen={true}
        onOpen={onOpen}
        tabIndex={0}
      />,
    );

    expect(onOpen).toHaveBeenCalledWith('activities');

    expect(screen.getByTestId('close-filter-group')).toBeVisible();
  });
});
