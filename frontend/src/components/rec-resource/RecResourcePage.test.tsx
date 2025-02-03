import { vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import { BrowserRouter as Router } from 'react-router-dom';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';
import * as routerDom from 'react-router-dom';

// Mock data
const mockResource = {
  rec_resource_id: 'REC1234',
  name: 'Resource Name',
  description: 'Resource Description',
  site_location: 'Resource Location',
  recreation_activity: [
    {
      recreation_activity_code: 1,
      description: 'Activity Description',
    },
  ],
  recreation_status: {
    status_code: 1,
    description: 'Open',
  },
};

// Setup mocks
vi.mock('@/service/hooks/useRecreationResourceApi');
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
}));

describe('RecResourcePage', () => {
  const renderComponent = async (mockApiResponse: any) => {
    const mockApi = {
      getRecreationResourceById: vi.fn().mockResolvedValue(mockApiResponse),
    };
    (useRecreationResourceApi as any).mockReturnValue(mockApi);

    await act(async () => {
      render(
        <Router>
          <RecResourcePage />
        </Router>,
      );
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(routerDom.useParams).mockReturnValue({ id: 'REC1234' });
  });

  describe('Error handling', () => {
    it('displays not found message on error', async () => {
      const mockApi = {
        getRecreationResourceById: vi
          .fn()
          .mockRejectedValue(new Error('Not found')),
      };
      (useRecreationResourceApi as any).mockReturnValue(mockApi);

      await act(async () => {
        render(
          <Router>
            <RecResourcePage />
          </Router>,
        );
      });

      expect(screen.getByText(/Resource not found/i)).toBeInTheDocument();
    });
  });

  describe('Activities section', () => {
    it('shows activities when present', async () => {
      await renderComponent(mockResource);

      expect(
        screen.getByRole('heading', { name: /Things to Do/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Activity Description/i)).toBeInTheDocument();
    });

    it('hides activities when empty', async () => {
      await renderComponent({
        ...mockResource,
        recreation_activity: [],
      });

      expect(
        screen.queryByRole('heading', { name: /Things to Do/i }),
      ).toBeNull();
      expect(screen.queryByText(/Activity Description/i)).toBeNull();
    });
  });

  describe('Status handling', () => {
    it('displays open status correctly', async () => {
      await renderComponent(mockResource);

      expect(screen.getByAltText(/Site Open status icon/i)).toBeInTheDocument();
      expect(screen.getByText(/Open/i)).toBeInTheDocument();
    });

    it('displays closed status correctly', async () => {
      await renderComponent({
        ...mockResource,
        recreation_status: { status_code: 2, description: 'Closed' },
      });

      expect(
        screen.getByAltText(/Site Closed status icon/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Closed/i)).toBeInTheDocument();
    });

    it('does not display missing status', async () => {
      await renderComponent({
        ...mockResource,
        recreation_status: { status_code: undefined, description: undefined },
      });

      expect(screen.queryByAltText(/Site.*status icon/i)).toBeNull();
    });

    it('ignores unknown status codes', async () => {
      await renderComponent({
        ...mockResource,
        recreation_status: { status_code: '03', description: 'Unknown' },
      });

      expect(screen.queryByAltText(/Site.*status icon/i)).toBeNull();
    });
  });

  describe('Closures section', () => {
    it('shows closure information when closed', async () => {
      await renderComponent({
        ...mockResource,
        recreation_status: {
          status_code: 2,
          description: 'Closed',
          comment: 'This site is closed',
        },
      });

      expect(
        screen.getByRole('heading', { name: /Closures/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/This site is closed/i)).toBeInTheDocument();
    });

    it('hides closure information when open', async () => {
      await renderComponent({
        ...mockResource,
        recreation_status: {
          status_code: 1,
          description: 'Open',
          comment: 'This site is open',
        },
      });

      expect(screen.queryByRole('heading', { name: /Closures/i })).toBeNull();
      expect(screen.queryByText(/This site is open/i)).toBeNull();
    });
  });
});
