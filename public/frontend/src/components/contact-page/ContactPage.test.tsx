import { render, screen, fireEvent } from '@testing-library/react';
import { ContactPage } from './ContactPage';
import React from 'react';
import { vi } from 'vitest';
import { CONTACT_TOPICS } from '@/components/contact-page/constants';

vi.mock('@/components/landing-page/components', () => ({
  SectionHeading: (props: any) => <div>{props.children}</div>,
}));
vi.mock('@/components/layout/PageWithScrollMenu', () => {
  return {
    __esModule: true,
    PageWithScrollMenu: function PageWithScrollMenuMock({ children }: any) {
      return <div>{children([React.createRef(), React.createRef()])}</div>;
    },
  };
});
vi.mock('@/components/layout/PageMenu', () => ({
  default: () => <div data-testid="page-menu" />,
}));
vi.mock('@/components/layout/PageTitle', () => ({
  default: (props: any) => <div data-testid="page-title">{props.title}</div>,
}));
vi.mock('@/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
  useBreadcrumbs: () => {},
}));
vi.mock(
  '@/service/queries/recreation-resource/recreationResourceQueries',
  () => ({
    useGetRecreationResourceById: () => ({ data: { name: 'Test Resource' } }),
  }),
);
vi.mock('@/utils/getContactEmailLink', () => ({
  getContactEmailLink: () => 'mailto:recinfo@gov.bc.ca',
}));
vi.mock('react-router', () => ({
  useParams: () => ({ id: '123' }),
  Link: (props: any) => <a {...props} />,
}));

describe('ContactPage', () => {
  it('renders page title and breadcrumbs', () => {
    render(<ContactPage />);
    expect(screen.getByTestId('page-title')).toHaveTextContent('Test Resource');
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders popular topics', () => {
    render(<ContactPage />);
    expect(screen.getByText('Popular topics')).toBeInTheDocument();
    expect(
      screen.getAllByText('Reservations, fees, and discounts')[0],
    ).toBeInTheDocument();
    expect(screen.getByText('Rules and etiquette')).toBeInTheDocument();
    expect(screen.getByText('Campfires')).toBeInTheDocument();
    expect(screen.getByText('Planning your trip')).toBeInTheDocument();
  });

  it('renders contact form and changes topic', () => {
    render(<ContactPage />);
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
    // Default topic details
    expect(
      screen.getByText(
        'The majority of recreation sites are on a "first come, first served" basis and cannot be booked ahead of time.',
      ),
    ).toBeInTheDocument();
    // Change topic
    fireEvent.change(screen.getByLabelText('Topic'), {
      target: { value: CONTACT_TOPICS.SITE_OR_TRAIL },
    });
    expect(
      screen.getByText(
        'We answer emails weekdays from 8:30am to 4:30pm Pacific Time. We make every effort to respond within a week, but it may take longer during peak summer season.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('recinfo@gov.bc.ca')).toBeInTheDocument();
  });

  it('renders wildfire section', () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText('Topic'), {
      target: { value: CONTACT_TOPICS.WILDFIRES },
    });
    expect(
      screen.getAllByText('Wildfires and Campfire Bans')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByText('WildfireBC')[0]).toBeInTheDocument();
    expect(screen.getByText('Report a Wildfire')).toBeInTheDocument();
    expect(screen.getByText('Wildfire Information Line')).toBeInTheDocument();
    expect(screen.getByText('Burn Registration Line')).toBeInTheDocument();
    expect(screen.getByText('Campfire Bans')).toBeInTheDocument();
  });

  it('renders RAPP section', () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText('Topic'), {
      target: { value: CONTACT_TOPICS.RAPP },
    });
    expect(
      screen.getByText('Report All Poachers and Polluters (RAPP)'),
    ).toBeInTheDocument();
    expect(screen.getByText('RAPP form')).toBeInTheDocument();
  });

  it('renders Natural Resource Violation section', () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText('Topic'), {
      target: { value: CONTACT_TOPICS.NATURAL_RESOURCE_VIOLATION },
    });
    expect(
      screen.getAllByText('Report a Natural Resource Violation')[0],
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => {
        return content.includes(
          'if you wish to report an unauthorized activity',
        );
      }),
    ).toBeInTheDocument();
  });
});
