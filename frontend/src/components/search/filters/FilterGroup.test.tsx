import { fireEvent, render, screen } from '@testing-library/react';
import FilterGroup from '@/components/search/filters/FilterGroup';
import { activitiesOptions } from '@/components/search/test/mock-data';
import { describe, expect, it, Mock, vi } from 'vitest';
import { useSearchParams } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]), // Default empty params
  };
});

describe('the FilterGroup component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('renders a filter group with a label and options', () => {
    render(
      <FilterGroup
        label="Activities"
        options={activitiesOptions}
        param="activities"
      />,
    );

    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Snowmobiling (9)')).toBeVisible();
    expect(screen.getByText('Angling (14)')).toBeVisible();
    expect(screen.getByText('Canoeing (5)')).toBeVisible();
    expect(screen.getByText('Camping (12)')).toBeVisible();
  });

  it('should render show all/less buttons click and use keyboard input', () => {
    const newOptions = [
      ...activitiesOptions,
      {
        id: 33,
        count: 13,
        description: 'New Activity',
        hasFocus: false,
      },
      {
        id: 34,
        count: 0,
        description: 'New Activity 2',
        hasFocus: false,
      },
      {
        id: 35,
        count: 13,
        description: 'New Activity 2',
        hasFocus: false,
      },
    ];
    const c = (
      <FilterGroup label="Activities" options={newOptions} param="activities" />
    );
    const { getByText } = render(c);

    const showAllButton = getByText(/Show all/);

    if (showAllButton) {
      fireEvent.click(showAllButton);
      fireEvent.keyDown(showAllButton, {
        key: 'Enter',
        code: 13,
        charCode: 13,
      });
      fireEvent.keyDown(showAllButton, { key: ' ' });
    }

    expect(showAllButton).toBeVisible();
  });

  it('should skip focus if all the options bellow are disabled', () => {
    const newOptions = [
      ...activitiesOptions,
      {
        id: 33,
        count: 13,
        description: 'New Activity',
        hasFocus: false,
      },
      {
        id: 34,
        count: 0,
        description: 'New Activity 2',
        hasFocus: false,
      },
      {
        id: 35,
        count: 0,
        description: 'New Activity 2',
        hasFocus: false,
      },
    ];
    const c = (
      <FilterGroup label="Activities" options={newOptions} param="activities" />
    );
    const { getByText } = render(c);

    const showAllButton = getByText(/Show all/);

    if (showAllButton) {
      fireEvent.click(showAllButton);
      fireEvent.keyDown(showAllButton, {
        key: 'Enter',
        code: 13,
        charCode: 13,
      });
      fireEvent.keyDown(showAllButton, { key: ' ' });
    }

    expect(showAllButton).toBeVisible();
  });

  it('should not check any options by default', () => {
    render(
      <FilterGroup
        label="Activities"
        options={activitiesOptions}
        param="activities"
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
      <FilterGroup
        label="Activities"
        options={activitiesOptions}
        param="activities"
      />,
    );
    const checkbox = screen.getByLabelText('Angling (14)');
    checkbox.click();
    expect(checkbox).toBeChecked();
  });

  it('should uncheck an option when clicked twice', () => {
    render(
      <FilterGroup
        label="Activities"
        options={activitiesOptions}
        param="activities"
      />,
    );

    const checkbox = screen.getByLabelText('Angling (14)');
    checkbox.click();
    checkbox.click();
    expect(checkbox).not.toBeChecked();
  });

  it('should have checkbox checked and enabled when defaultChecked is true and count is 0', () => {
    const testOptions = [
      { id: 22, count: 0, description: 'Snowmobiling', hasFocus: false },
      { id: 2, count: 14, description: 'Angling', hasFocus: false },
    ];

    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams({ activities: '22' }), // Snowmobiling
      vi.fn(),
    ]);

    render(
      <FilterGroup
        label="Activities"
        options={testOptions}
        param="activities"
      />,
    );

    const snowmobilingCheckbox = screen.getByLabelText('Snowmobiling (0)');
    const anglingCheckbox = screen.getByLabelText('Angling (14)');

    // Checkbox with ID 22 (Snowmobiling) should be checked and enabled because it's in the URL params
    expect(snowmobilingCheckbox).toBeChecked();
    expect(snowmobilingCheckbox).toBeEnabled();

    // Checkbox with ID 2 (Angling) should not be checked, but enabled because count > 0
    expect(anglingCheckbox).not.toBeChecked();
    expect(anglingCheckbox).toBeEnabled();
  });

  it('should update aria-label when toggling show all / show less', () => {
    const newOptions = [
      ...activitiesOptions,
      {
        id: 33,
        count: 13,
        description: 'District 1',
        hasFocus: false,
      },
      {
        id: 34,
        count: 0,
        description: 'District 2',
        hasFocus: false,
      },
    ];

    render(
      <FilterGroup label="District" options={newOptions} param="district" />,
    );

    const button = screen.getByRole('button', { name: /show all/i });

    expect(button).toHaveAttribute('aria-label', `Show all 6 District options`);

    // Click to toggle
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-label', 'Show less District options');
  });
});
