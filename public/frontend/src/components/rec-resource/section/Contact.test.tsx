import { render, screen } from '@testing-library/react';
import Contact from './Contact';
import { ResponseError } from '@/service/recreation-resource';
import * as getContactEmailLinkModule from '@/utils/getContactEmailLink';

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

  const refetchDataMock = () => {
    return;
  };

  beforeEach(() => {
    vi.spyOn(getContactEmailLinkModule, 'getContactEmailLink').mockReturnValue(
      'mailto:test@example.com',
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders component with site operator name', async () => {
    render(
      <Contact
        siteOperator={siteOperator}
        error={null}
        isLoading={false}
        refetchData={null}
      />,
    );
    const operatorName = screen.getByText(/Site Operator Name/);
    const operatorLabel = screen.getByText(/Site operator/);

    expect(operatorName).toBeInTheDocument();
    expect(operatorLabel).toBeInTheDocument();
    expect(getContactEmailLinkModule.getContactEmailLink).toHaveBeenCalled();
  });

  it('renders component with loading state', async () => {
    render(
      <Contact
        siteOperator={undefined}
        error={null}
        isLoading={true}
        refetchData={null}
      />,
    );
    const element = screen.getByText(/Loading .../);

    expect(element).toBeInTheDocument();
    expect(getContactEmailLinkModule.getContactEmailLink).toHaveBeenCalled();
  });

  it('renders component with error 500', async () => {
    const responseError = new ResponseError(
      new Response(null, { status: 500, statusText: 'api error' }),
      'error',
    );
    render(
      <Contact
        siteOperator={undefined}
        error={responseError}
        isLoading={false}
        refetchData={null}
      />,
    );
    const operatorLabel = screen.queryByTestId('error-message');

    expect(operatorLabel).toBeInTheDocument();
    expect(getContactEmailLinkModule.getContactEmailLink).toHaveBeenCalled();
  });

  it('renders component with error 500 and click on retry', async () => {
    const responseError = new ResponseError(
      new Response(null, { status: 500, statusText: 'api error' }),
      'error',
    );
    render(
      <Contact
        siteOperator={undefined}
        error={responseError}
        isLoading={false}
        refetchData={refetchDataMock}
      />,
    );
    const operatorLabel = screen.queryByTestId('error-message');

    const retryLink = screen.getByText(/Click here to retry./);

    retryLink.click();

    expect(operatorLabel).toBeInTheDocument();
    expect(getContactEmailLinkModule.getContactEmailLink).toHaveBeenCalled();
  });

  it('renders component with error 404', async () => {
    const responseError = new ResponseError(
      new Response(null, { status: 404, statusText: 'not found' }),
      'not found',
    );
    render(
      <Contact
        siteOperator={undefined}
        error={responseError}
        isLoading={false}
        refetchData={null}
      />,
    );
    const operatorLabel = screen.queryByTestId('operator-result');

    expect(operatorLabel).toBeNull();
    expect(getContactEmailLinkModule.getContactEmailLink).toHaveBeenCalled();
  });

  it('displays the correct contact hours', async () => {
    render(
      <Contact
        siteOperator={siteOperator}
        error={null}
        isLoading={false}
        refetchData={null}
      />,
    );
    const contactHours = screen.getByText(
      /We answer emails weekdays from 8:30 am to 4:30 pm Pacific Time./,
    );

    expect(contactHours).toBeVisible();
    expect(getContactEmailLinkModule.getContactEmailLink).toHaveBeenCalled();
  });
});
