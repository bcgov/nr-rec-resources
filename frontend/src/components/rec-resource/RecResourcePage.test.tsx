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
});
