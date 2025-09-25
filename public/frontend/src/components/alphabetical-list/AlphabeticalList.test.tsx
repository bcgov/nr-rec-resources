import { render, screen, fireEvent } from '@/test-utils';
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
    recreation_resource_type: 'Recreation Site',
    recreation_resource_type_code: 'SIT',
  },
  {
    rec_resource_id: '2',
    name: 'Aileen Lake',
    recreation_resource_type: 'Trail',
    recreation_resource_type_code: 'RTR',
  },
  {
    rec_resource_id: '3',
    name: 'Abbott Creek',
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

    // Names are in lowercase as we use CSS text-transform: capitalize for all caps edge case names
    expect(screen.getByText('abhau lake')).toBeInTheDocument();
    expect(screen.getByText('aileen lake')).toBeInTheDocument();
    expect(screen.getByText('abbott creek')).toBeInTheDocument();
  });

  it('renders resource types for each resource', () => {
    render(
      <AlphabeticalList
        resources={mockResources}
        isLoading={false}
        selectedLetter="A"
      />,
    );

    expect(screen.getAllByText('Recreation Site')).toHaveLength(2);
    expect(screen.getByText('Trail')).toBeInTheDocument();
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
