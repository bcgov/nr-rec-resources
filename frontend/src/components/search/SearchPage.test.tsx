import { act, render, screen } from '@testing-library/react';
import SearchPage from '@/components/search/SearchPage';
import { BrowserRouter as Router } from 'react-router-dom';
import apiService from '@/service/api-service';

const mockOpenStatus = {
  description: 'Open',
  comment: 'Site is open',
  status_code: 1,
};

const mockClosedStatus = {
  description: 'Closed',
  comment: 'Site is closed',
  status_code: 2,
};

const mockResources = {
  data: {
    data: [
      {
        rec_resource_id: 'REC204117',
        name: '0 K SNOWMOBILE PARKING LOT',
        site_location: 'MERRITT',
        recreation_activity: [
          {
            description: 'Snowmobiling',
            recreation_activity_code: 22,
          },
        ],
        recreation_status: mockOpenStatus,
      },
      {
        rec_resource_id: 'REC203239',
        name: '10 K SNOWMOBILE PARKING LOT',
        site_location: 'MERRITT',
        recreation_activity: [
          {
            description: 'Snowmobiling',
            recreation_activity_code: 22,
          },
        ],
        recreation_status: mockOpenStatus,
      },
      {
        rec_resource_id: 'REC1222',
        name: '100 ROAD BRIDGE',
        site_location: 'PRINCE GEORGE',
        recreation_activity: [
          {
            description: 'Picnicking',
            recreation_activity_code: 9,
          },
          {
            description: 'Angling',
            recreation_activity_code: 1,
          },
        ],
        recreation_status: mockClosedStatus,
      },
      {
        rec_resource_id: 'REC160773',
        name: '10K CABIN',
        site_location: 'MERRITT',
        recreation_activity: [
          {
            description: 'Snowmobiling',
            recreation_activity_code: 22,
          },
        ],
        recreation_status: mockOpenStatus,
      },
      {
        rec_resource_id: 'REC203900',
        name: '18 Mile',
        site_location: 'REVELSTOKE',
        recreation_activity: [
          {
            description: 'Boating',
            recreation_activity_code: 2,
          },
          {
            description: 'Hiking',
            recreation_activity_code: 12,
          },
          {
            description: 'Beach Activities',
            recreation_activity_code: 8,
          },
          {
            description: 'Camping',
            recreation_activity_code: 32,
          },
          {
            description: 'Angling',
            recreation_activity_code: 1,
          },
        ],
        recreation_status: mockOpenStatus,
      },
      {
        rec_resource_id: 'REC6866',
        name: '1861 GOLDRUSH PACK TRAIL',
        site_location: 'WELLS',
        recreation_activity: [
          {
            description: 'Ski Touring',
            recreation_activity_code: 33,
          },
          {
            description: 'Hiking',
            recreation_activity_code: 12,
          },
          {
            description: 'Snowshoeing',
            recreation_activity_code: 23,
          },
        ],
        recreation_status: mockClosedStatus,
      },
      {
        rec_resource_id: 'REC160432',
        name: '24 KM SHELTER',
        site_location: 'MERRITT',
        recreation_activity: [
          {
            description: 'Snowmobiling',
            recreation_activity_code: 22,
          },
        ],
        recreation_status: mockOpenStatus,
      },
      {
        rec_resource_id: 'REC6739',
        name: '24 MILE SNOWMOBILE AREA',
        site_location: 'CASTLEGAR',
        recreation_activity: [
          {
            description: 'Snowmobiling',
            recreation_activity_code: 22,
          },
        ],
        recreation_status: mockOpenStatus,
      },
      {
        rec_resource_id: 'REC16158',
        name: '27 Swithbacks',
        site_location: 'WHISTLER',
        recreation_activity: [
          {
            description: 'Mountain Biking',
            recreation_activity_code: 27,
          },
        ],
        recreation_status: {
          description: undefined,
          comment: undefined,
          status_code: undefined,
        },
      },
      {
        rec_resource_id: 'REC2094',
        name: '40 Mile CAMP / BULL River',
        site_location: 'FERNIE',
        recreation_activity: [
          {
            description: 'Angling',
            recreation_activity_code: 1,
          },
        ],
        recreation_status: mockOpenStatus,
      },
    ],
    page: 1,
    total: 51,
  },
};

describe('the SearchPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders the default list of resources', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue(mockResources),
    });
    await act(async () => {
      render(
        <Router>
          <SearchPage />
        </Router>,
      );
    });

    mockResources.data.data.forEach((resource) => {
      const resourceElement = screen.getByText(resource.name.toLowerCase());
      expect(resourceElement).toBeInTheDocument();
    });

    // loop through the resources and check if the site location is displayed
    mockResources.data.data.forEach((resource) => {
      const resourceElement = screen
        .getByText(resource.name.toLowerCase())
        .parentElement?.parentElement?.querySelector('p');
      expect(resourceElement).toBeInTheDocument();
    });
  });

  it('displays the total results found', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue(mockResources),
    });
    await act(async () => {
      render(
        <Router>
          <SearchPage />
        </Router>,
      );
    });

    expect(
      // This is a workaround to get the text content of the element since it's broken up with <b> tag
      screen.getAllByText(
        (_, element) => element?.textContent === '51 Results',
      )[0],
    ).toBeInTheDocument();
  });

  it('displays the Load More button if there are more than 10 results', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue(mockResources),
    });
    await act(async () => {
      render(
        <Router>
          <SearchPage />
        </Router>,
      );
    });

    expect(
      screen.getByRole('button', { name: 'Load More' }),
    ).toBeInTheDocument();
  });

  it('does not display the Load More button if there are less than 10 results', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          ...mockResources,
          total: 5,
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <SearchPage />
        </Router>,
      );
    });

    expect(
      screen.queryByRole('button', { name: 'Load More' }),
    ).not.toBeInTheDocument();
  });

  it('displays No results found when no results are found', async () => {
    vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
      get: vi.fn().mockResolvedValue({
        data: {
          data: [],
          page: 1,
          total: 0,
        },
      }),
    });
    await act(async () => {
      render(
        <Router>
          <SearchPage />
        </Router>,
      );
    });

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
