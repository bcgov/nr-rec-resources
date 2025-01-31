import { render, screen } from '@testing-library/react';
import FilterMenu from '@/components/search/filters/FilterMenu';

const mockMenuContent = [
  {
    type: 'multi-select',
    label: 'Activities',
    param: 'activities',
    options: [
      {
        id: 22,
        count: 9,
        description: 'Snowmobiling',
      },
      {
        id: 1,
        count: 14,
        description: 'Angling',
      },
      {
        id: 3,
        count: 5,
        description: 'Canoeing',
      },
      {
        id: 32,
        count: 12,
        description: 'Camping',
      },
    ],
  },
  {
    type: 'multi-select',
    label: 'Status',
    param: 'status',
    options: [
      {
        id: 1,
        count: 8,
        description: 'Open',
      },
      {
        id: 2,
        count: 5,
        description: 'Closed',
      },
    ],
  },
];

describe('FilterMenu', () => {
  beforeEach(() => {
    vi.mock('react-router-dom', async () => {
      const actual = (await vi.importActual('react-router-dom')) as any;
      return {
        ...actual,
        useSearchParams: vi.fn().mockReturnValue([new URLSearchParams()]),
      };
    });
  });
  it('renders FilterMenu component', () => {
    render(<FilterMenu menuContent={mockMenuContent} />);

    // Renders titles
    expect(screen.getByText('Filter')).toBeVisible();
    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();

    // Renders filter labels with count
    expect(screen.getByText('Snowmobiling (9)')).toBeVisible();
    expect(screen.getByText('Angling (14)')).toBeVisible();
    expect(screen.getByText('Canoeing (5)')).toBeVisible();
    expect(screen.getByText('Camping (12)')).toBeVisible();
    expect(screen.getByText('Open (8)')).toBeVisible();
    expect(screen.getByText('Closed (5)')).toBeVisible();

    // Renders checkboxes
    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
  });
});
