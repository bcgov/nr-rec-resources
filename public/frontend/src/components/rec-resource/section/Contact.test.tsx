import { screen } from '@testing-library/react';
import { afterEach, vi, describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test-utils';
import Contact from './Contact';
import { ResponseError } from '@/service/recreation-resource';

describe('Contact component', () => {
  const siteOperator = {
    acronym: '',
    clientName: 'SITE OPERATOR NAME',
    clientNumber: '0001',
    clientStatusCode: 'ACT',
    clientTypeCode: 'C',
    legalFirstName: 'FIRSTNAME',
    legalMiddleName: '',
  };

  const refetchDataMock = vi.fn();

  const defaultProps = {
    rec_resource_id: 'REC1234',
    error: null,
    isLoading: false,
    refetchData: refetchDataMock,
  };

  const renderContact = async (props: any = {}) => {
    return await renderWithRouter(<Contact {...defaultProps} {...props} />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('renders component with site operator name', async () => {
    await renderContact({ siteOperator });
    const operatorName = screen.getByText(/Site Operator Name/);
    const operatorLabel = screen.getByText(/Site operator/);

    expect(operatorName).toBeInTheDocument();
    expect(operatorLabel).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    await renderContact({ isLoading: true });
    const loadingMessage = screen.getByText('Loading ...');
    expect(loadingMessage).toBeInTheDocument();
  });

  it('renders error state with retry link', async () => {
    const mockResponse = {
      status: 500,
      statusText: 'Internal Server Error',
    } as Response;

    const error = new ResponseError(mockResponse, 'Server Error');

    await renderContact({ error });
    const errorMessage = screen.getByTestId('error-message');
    const retryLink = screen.getByText('Click here to retry.');

    expect(errorMessage).toBeInTheDocument();
    expect(retryLink).toBeInTheDocument();
  });

  it('renders Contact Us link with correct path', async () => {
    await renderContact();
    const contactLink = screen.getByText('Contact us');

    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest('a')).toHaveAttribute(
      'href',
      '/resource/REC1234/contact',
    );
  });

  it('renders general questions section', async () => {
    await renderContact();
    const generalQuestions = screen.getByText(
      /General questions and feedback for Recreation Sites and Trails BC/,
    );
    const weekdaysText = screen.getByText(
      /We answer emails weekdays from 8:30 am to 4:30 pm Pacific Time./,
    );

    expect(generalQuestions).toBeInTheDocument();
    expect(weekdaysText).toBeInTheDocument();
  });

  it('does not render site operator section when error is present', async () => {
    const mockResponse = {
      status: 400,
      statusText: 'Bad Request',
    } as Response;

    const error = new ResponseError(mockResponse, 'Client Error');

    await renderContact({ error });
    const operatorLabel = screen.queryByText(/Site operator/);
    expect(operatorLabel).not.toBeInTheDocument();
  });

  it('formats site operator name correctly', async () => {
    const operatorWithLowercase = {
      ...siteOperator,
      clientName: 'test operator name',
    };

    await renderContact({ siteOperator: operatorWithLowercase });
    const operatorName = screen.getByText('Firstname Test Operator Name');
    expect(operatorName).toBeInTheDocument();
  });
});
