import { vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import { BrowserRouter as Router } from 'react-router-dom';
import apiService from '@/service/api-service';

const mockResource = {
  rec_resource_id: 'REC1234',
  name: 'Resource Name',
  description: 'Resource Description',
  site_location: 'Resource Location',
  recreation_activity: [
    {
      recreation_activity_code: '01',
      description: 'Activity Description',
    },
  ],
  recreation_status: {
    status_code: '01',
    description: 'Open',
  },
};

describe('RecResourcePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders the not found message when the resource is not found', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue(null),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const notFoundElement = screen.getByText(/Resource not found/i);

    expect(notFoundElement).toBeInTheDocument();
  });

  it('renders the resource when the resource is found', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: mockResource,
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const nameElement = screen.getByText(/Resource Name/i);
    const descriptionElement = screen.getByText(/Resource Description/i);
    const locationElement = screen.getByText(/Resource Location/i);

    expect(nameElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
    expect(locationElement).toBeInTheDocument();
  });

  it('renders the Things to Do section when recreation_activity is present', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: mockResource,
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const thingsToDoElement = screen.getByRole('heading', {
      name: /Things to Do/i,
    });
    const activityElement = screen.getByText(/Activity Description/i);

    expect(thingsToDoElement).toBeInTheDocument();
    expect(activityElement).toBeInTheDocument();
  });

  it('does not render the Things to Do section when recreation_activity is not present', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResource,
          recreation_activity: [],
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const thingsToDoElement = screen.queryByRole('heading', {
      name: /Things to Do/i,
    });
    const activityElement = screen.queryByText(/Activity Description/i);

    expect(thingsToDoElement).toBeNull();
    expect(activityElement).toBeNull();
  });

  it('renders the Open status when recreation_status is present', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: mockResource,
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const statusIcon = screen.getByAltText(/Site Open status icon/i);
    const statusDescription = screen.getByText(/Open/i);

    expect(statusIcon).toBeInTheDocument();
    expect(statusDescription).toBeInTheDocument();
  });

  it('renders the Closed status when recreation_status is present', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResource,
          recreation_status: {
            status_code: '02',
            description: 'Closed',
          },
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const statusIcon = screen.getByAltText(/Site Closed status icon/i);
    const statusDescription = screen.getByText(/Closed/i);

    expect(statusIcon).toBeInTheDocument();
    expect(statusDescription).toBeInTheDocument();
  });

  it('does not render the status when recreation_status is not present', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResource,
          recreation_status: {
            status_code: undefined,
            description: undefined,
            comment: undefined,
          },
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const statusIcon = screen.queryByAltText(/Site Open status icon/i);
    const statusDescription = screen.queryByText(/Open/i);

    expect(statusIcon).toBeNull();
    expect(statusDescription).toBeNull();
  });

  it('does not render an unknown status when the status code is not recognized', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResource,
          recreation_status: {
            status_code: '03',
            description: 'Unknown',
          },
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const statusIcon = screen.queryByAltText(/Site Unknown status icon/i);
    const statusDescription = screen.queryByText(/Unknown/i);

    expect(statusIcon).toBeNull();
    expect(statusDescription).toBeNull();
  });

  it('renders the Closures section when recreation_status is closed', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResource,
          recreation_status: {
            status_code: '02',
            description: 'Closed',
            comment: 'This site is closed',
          },
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const closuresElement = screen.getByRole('heading', {
      name: /Closures/i,
    });
    const commentElement = screen.getByText(/This site is closed/i);

    expect(closuresElement).toBeInTheDocument();
    expect(commentElement).toBeInTheDocument();
  });

  it('does not render the Closures section when recreation_status is open', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResource,
          recreation_status: {
            status_code: '01',
            description: 'Open',
            comment: 'This site is open',
          },
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
    const closuresElement = screen.queryByRole('heading', {
      name: /Closures/i,
    });
    const commentElement = screen.queryByText(/This site is open/i);

    expect(closuresElement).toBeNull();
    expect(commentElement).toBeNull();
  });
});
