import { render, screen, fireEvent, within } from '@/test-utils';
import { AlphabeticalList } from './AlphabeticalList';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';

const mockSetSearchParams = vi.fn();

let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

const mockResources: AlphabeticalRecreationResourceModel[] = [
  {
    rec_resource_id: '1',
    name: 'Abhau Lake',
    closest_community: 'VERNON',
    recreation_resource_type: 'Recreation Site',
    recreation_resource_type_code: 'SIT',
  },
  {
    rec_resource_id: '2',
    name: 'Aileen Lake',
    closest_community: 'MERRITT',
    recreation_resource_type: 'Trail',
    recreation_resource_type_code: 'RTR',
  },
  {
    rec_resource_id: '3',
    name: 'Abbott Creek',
    closest_community: 'PRINCE GEORGE',
    recreation_resource_type: 'Recreation Site',
    recreation_resource_type_code: 'SIT',
  },
];

describe('AlphabeticalList', () => {
  it('renders loading spinner when isLoading is true', () => {
    render(
      <AlphabeticalList
        resources={undefined}
        isLoading={true}
        selectedLetter="A"
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading resources...')).toBeInTheDocument();
  });

  it('renders no results message when resources array is empty', () => {
    render(
      <AlphabeticalList resources={[]} isLoading={false} selectedLetter="Z" />,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No results found starting with "Z". Try selecting a different letter.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the selected letter as a heading', () => {
    render(
      <AlphabeticalList
        resources={mockResources}
        isLoading={false}
        selectedLetter="A"
      />,
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders all resources in a list', () => {
    render(
      <AlphabeticalList
        resources={mockResources}
        isLoading={false}
        selectedLetter="A"
      />,
    );

    expect(screen.getByText('Abhau Lake')).toBeInTheDocument();
    expect(screen.getByText('Aileen Lake')).toBeInTheDocument();
    expect(screen.getByText('Abbott Creek')).toBeInTheDocument();
  });

  it('renders resource types for each resource', () => {
    render(
      <AlphabeticalList
        resources={mockResources}
        isLoading={false}
        selectedLetter="A"
      />,
    );

    const listItems = screen.getAllByRole('listitem');

    expect(listItems).toHaveLength(3);

    expect(
      within(listItems[0]).getByText(/Recreation Site/),
    ).toBeInTheDocument();
    expect(within(listItems[1]).getByText(/Trail/)).toBeInTheDocument();
    expect(
      within(listItems[2]).getByText(/Recreation Site/),
    ).toBeInTheDocument();
  });

  it('renders closest community for each resource', () => {
    render(
      <AlphabeticalList
        resources={mockResources}
        isLoading={false}
        selectedLetter="A"
      />,
    );

    const listItems = screen.getAllByRole('listitem');

    expect(within(listItems[0]).getByText(/Vernon/)).toBeInTheDocument();
    expect(within(listItems[1]).getByText(/Merritt/)).toBeInTheDocument();
    expect(within(listItems[2]).getByText(/Prince George/)).toBeInTheDocument();
  });

  describe('type filter functionality', () => {
    beforeEach(() => {
      mockSetSearchParams.mockClear();
      mockSearchParams = new URLSearchParams();
    });

    it('shows basic no results message when no type filter is present', () => {
      render(
        <AlphabeticalList
          resources={[]}
          isLoading={false}
          selectedLetter="Z"
        />,
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(
        screen.getByText(
          'No results found starting with "Z". Try selecting a different letter.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('clearing your filters'),
      ).not.toBeInTheDocument();
    });

    it('shows type filter message and clear button when type filter is present', () => {
      mockSearchParams = new URLSearchParams('type=1');

      render(
        <AlphabeticalList
          resources={[]}
          isLoading={false}
          selectedLetter="Z"
        />,
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(
        screen.getByText((_content, element) => {
          return (
            element?.textContent ===
            'No results found starting with "Z". Try selecting a different letter or clearing your filters.'
          );
        }),
      ).toBeInTheDocument();
      expect(screen.getByText('clearing your filters')).toBeInTheDocument();
    });

    it('calls setSearchParams to remove type filter when clear button is clicked', () => {
      mockSearchParams = new URLSearchParams('type=1&letter=Z');

      render(
        <AlphabeticalList
          resources={[]}
          isLoading={false}
          selectedLetter="Z"
        />,
      );

      const clearButton = screen.getByText('clearing your filters');
      fireEvent.click(clearButton);

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
        }),
      );

      const callArgs = mockSetSearchParams.mock.calls[0][0];
      expect(callArgs.toString()).toBe('letter=Z');
    });
  });
});
