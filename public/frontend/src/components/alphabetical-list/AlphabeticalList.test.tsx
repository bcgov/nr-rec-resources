import { render, screen } from '@/test-utils';
import { AlphabeticalList } from './AlphabeticalList';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
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

  it('renders no resources message when resources array is empty', () => {
    render(
      <AlphabeticalList resources={[]} isLoading={false} selectedLetter="Z" />,
    );

    expect(screen.getByText('No resources found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No recreation resources found starting with "Z". Try selecting a different letter.',
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
});
