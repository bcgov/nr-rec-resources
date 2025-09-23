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
    name: 'Alice Lake Recreation Site',
    recreation_resource_type: 'Recreation Site',
    recreation_resource_type_code: 'SIT',
  },
  {
    rec_resource_id: '2',
    name: 'Arrowhead Trail',
    recreation_resource_type: 'Trail',
    recreation_resource_type_code: 'RTR',
  },
  {
    rec_resource_id: '3',
    name: 'Bear Creek Recreation Site',
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

    expect(screen.getByText('Alice Lake Recreation Site')).toBeInTheDocument();
    expect(screen.getByText('Arrowhead Trail')).toBeInTheDocument();
    expect(screen.getByText('Bear Creek Recreation Site')).toBeInTheDocument();
  });

  it('renders resource types for each resource', () => {
    render(
      <AlphabeticalList
        resources={mockResources}
        isLoading={false}
        selectedLetter="A"
      />,
    );

    expect(screen.getAllByText('(Recreation Site)')).toHaveLength(2);
    expect(screen.getByText('(Trail)')).toBeInTheDocument();
  });
});
