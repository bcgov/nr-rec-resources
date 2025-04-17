import { render, screen } from '@testing-library/react';
import Contact from './Contact';
import { ResponseError } from '@/service/recreation-resource';

describe('the Contact component', () => {
  const siteOperator = {
    acronym: '',
    clientName: 'SITE OPERATOR NAME',
    clientNumber: '0001',
    clientStatusCode: 'ACT',
    clientTypeCode: 'C',
    legalFirstName: '',
    legalMiddleName: '',
  };
  it('renders component with site operator name', async () => {
    render(
      <Contact siteOperator={siteOperator} error={null} isLoading={false} />,
    );
    const operatorName = screen.getByText(/Site Operator Name/);
    const operatorLabel = screen.getByText(/Site operator/);

    expect(operatorName).toBeInTheDocument();
    expect(operatorLabel).toBeInTheDocument();
  });

  it('renders component with loading state', async () => {
    render(<Contact siteOperator={undefined} error={null} isLoading={true} />);
    const element = screen.getByText(/Loading .../);

    expect(element).toBeInTheDocument();
  });

  it('renders component with error', async () => {
    render(
      <Contact
        siteOperator={undefined}
        error={new ResponseError(new Response(null), 'not found')}
        isLoading={false}
      />,
    );
    const operatorLabel = screen.queryByText(/Site operator/);

    expect(operatorLabel).toBeNull();
  });
});
