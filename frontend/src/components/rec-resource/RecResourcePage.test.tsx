import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import * as routerDom from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource';
import { ReactNode } from 'react';

// Setup mocks
vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(),
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
}));
vi.mock('@/components/rec-resource/MapsAndLocation', () => ({
  default: (): ReactNode => (
    <>
      <h2 className="section-heading">Maps and Location</h2>
    </>
  ),
}));

// Mock data
const mockResource = {
  rec_resource_id: 'REC1234',
  name: 'Resource Name',
  description: 'Resource Description',
  closest_community: 'Resource Location',
  recreation_access: ['Road', 'Boat-in'],
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
  recreation_resource_images: [
    {
      caption: 'test image',
      recreation_resource_image_variants: [
        { size_code: 'scr', url: 'preview-url' },
        { size_code: 'original', url: 'full-url' },
      ],
    },
  ],
};

describe('RecResourcePage', () => {
  const renderComponent = async (mockApiResponse: any, error?: any) => {
    (useGetRecreationResourceById as any).mockReturnValue({
      data: mockApiResponse,
      error: error,
    });

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
      await renderComponent(undefined, { response: { status: 404 } });
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

  describe('RecResourcePage - Maps and Location', () => {
    it('shows the access types in the Maps and Location section', async () => {
      await renderComponent(mockResource);

      expect(
        screen.getByRole('heading', { name: /Maps and Location/i }),
      ).toBeInTheDocument();
    });

    it('hides the Maps and Location section when there is no relevant information', async () => {
      await renderComponent({
        ...mockResource,
        recreation_access: [],
      });

      expect(
        screen.queryByRole('heading', { name: /Maps and Location/i }),
      ).toBeNull();
      expect(screen.queryByText(/Road/i)).toBeNull();
      expect(screen.queryByText(/Boat-in/i)).toBeNull();
    });

    describe('Maps and Location section visibility', () => {
      test.each([
        {
          name: 'shows section with spatial geometry',
          input: { spatial_feature_geometry: ['some-geometry'] },
          shouldShow: true,
        },
        {
          name: 'shows section with resource docs',
          input: { recreation_resource_docs: ['some-doc'] },
          shouldShow: true,
        },
        {
          name: 'hides section when empty',
          input: { spatial_feature_geometry: [], recreation_resource_docs: [] },
          shouldShow: false,
        },
      ])('$name', async ({ input, shouldShow }) => {
        await renderComponent({
          ...mockResource,
          recreation_access: [],
          ...input,
        });

        const matcher = shouldShow
          ? expect(screen.getByRole('heading', { name: /Maps and Location/i }))
          : expect(
              screen.queryByRole('heading', { name: /Maps and Location/i }),
            );

        matcher[shouldShow ? 'toBeInTheDocument' : 'toBeNull']();
      });
    });
  });

  describe('RecResourcePage - Additional Features', () => {
    describe('Additional Fees section', () => {
      it('displays additional fees when available', async () => {
        await renderComponent({
          ...mockResource,
          recreation_fee: [
            {
              fee_description: 'Parking Fee',
              recreation_fee_code: 'P',
              fee_amount: 10,
            },
          ],
        });

        expect(screen.getAllByText(/Parking Fee/i).length).toBeGreaterThan(0);
      });

      it('does not display additional fees when only camping fee exists', async () => {
        await renderComponent({
          ...mockResource,
          recreation_fee: [
            {
              fee_description: 'Camping Fee',
              recreation_fee_code: 'C',
              fee_amount: 25,
            },
          ],
        });

        expect(screen.queryByText(/Parking Fee/i)).toBeNull();
      });
    });

    describe('Facilities section', () => {
      it('displays facilities when recreation structure exists', async () => {
        await renderComponent({
          ...mockResource,
          recreation_structure: { has_toilet: true, has_table: true },
        });

        expect(screen.getAllByText(/Facilities/i).length).toBeGreaterThan(0);
      });

      it('does not display facilities when recreation structure is missing', async () => {
        await renderComponent({
          ...mockResource,
          recreation_structure: null,
        });

        expect(screen.queryByText(/Facilities/i)).toBeNull();
      });
    });
  });
});
