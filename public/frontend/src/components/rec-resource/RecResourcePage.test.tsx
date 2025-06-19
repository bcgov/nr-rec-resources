import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import * as routerDom from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  useGetRecreationResourceById,
  useGetSiteOperatorById,
} from '@/service/queries/recreation-resource';
import { ReactNode } from 'react';
import { AdditionalFees, Camping } from '@/components/rec-resource/section';

// Setup mocks
vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(),
  useGetSiteOperatorById: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/components/rec-resource/section', async () => ({
  ...(await vi.importActual('@/components/rec-resource/section')),
  MapsAndLocation: vi.fn(
    (): ReactNode => (
      <>
        <h2 className="section-heading">Maps and Location</h2>
      </>
    ),
  ),
  Camping: vi.fn(
    (): ReactNode => (
      <>
        <h2 className="section-heading">Camping</h2>
      </>
    ),
  ),
  AdditionalFees: vi.fn(
    (): ReactNode => (
      <>
        <h2 className="section-heading">AdditionalFees</h2>
      </>
    ),
  ),
}));

// Mock data
export const mockResource = {
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

    (useGetSiteOperatorById as any).mockReturnValue({
      data: {
        acronym: undefined,
        clientName: 'SITE OPERATOR NAME',
        clientNumber: '0001',
        clientStatusCode: 'ACT',
        clientTypeCode: 'C',
        legalFirstName: undefined,
        legalMiddleName: undefined,
      },
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

  describe('Error handling', async () => {
    it('redirects to not found page', async () => {
      await renderComponent(undefined, { response: { status: 404 } });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/404', { replace: true });
      });
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
          name: 'shows section with driving directions',
          input: { driving_directions: 'some-directions' },
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

  describe('Camping section', () => {
    const mockCampsiteCount = 10;
    const mockFees = [
      {
        fee_description: 'Hut Fee',
        recreation_fee_code: 'P',
        fee_amount: 10,
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();
    });

    test.each([
      { recreation_fee: mockFees },
      { campsite_count: mockCampsiteCount },
      { recreation_fee: mockFees, campsite_count: mockCampsiteCount },
    ])('displays camping section when %p', async (props) => {
      await renderComponent({
        ...mockResource,
        ...props,
      });
      const args = vi.mocked(Camping).mock.calls[0][0];
      if (props.recreation_fee) {
        expect(args.fees).toEqual(mockFees);
      }
      if (props.campsite_count) {
        expect(args.campsite_count).toEqual(mockCampsiteCount);
      }
    });

    test.each([
      { recreation_fee: undefined, campsite_count: undefined },
      { recreation_fee: undefined, campsite_count: 0 },
    ])(
      'does not display camping section when %p',
      async ({ recreation_fee, campsite_count }) => {
        await renderComponent({
          ...mockResource,
          recreation_fee,
          campsite_count,
        });
        expect(Camping).not.toHaveBeenCalled();
      },
    );
  });

  describe('Additional fees section', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('displays AdditionalFees section when additional fees are available', async () => {
      const additional_fees = [
        {
          fee_description: 'Hut Fee',
          recreation_fee_code: 'H',
          fee_amount: 10,
        },
      ];
      await renderComponent({
        ...mockResource,
        additional_fees,
      });
      const args = vi.mocked(AdditionalFees).mock.calls[0][0];
      expect(args.fees).toEqual(additional_fees);
    });

    describe('when additional fees are missing', () => {
      test.each([{ additional_fees: undefined }, { additional_fees: [] }])(
        'does not display AdditionalFees section when %p',
        async ({ additional_fees }) => {
          await renderComponent({
            ...mockResource,
            additional_fees,
          });
          expect(Camping).not.toHaveBeenCalled();
        },
      );
    });
  });

  describe('RecResourcePage - Additional Features', () => {
    describe('Facilities section', () => {
      it('displays facilities when recreation structure exists', async () => {
        await renderComponent({
          ...mockResource,
          recreation_structure: { has_toilet: true, has_table: true },
        });

        expect(screen.getAllByText(/Facilities/i).length).toBeGreaterThan(0);
      });

      it('displays facilities when only one recreation structure exists', async () => {
        await renderComponent({
          ...mockResource,
          recreation_structure: { has_toilet: false, has_table: true },
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

    describe('Page navigation menu conditional links', () => {
      test.each([
        {
          name: 'Closures',
          input: {
            recreation_status: {
              status_code: 2,
              description: 'Closed',
              comment: 'This site is closed',
            },
          },
        },
        {
          name: 'Description',
          description: 'Resource Description',
        },
        {
          name: 'Things to do',
          input: {
            recreation_activity: [
              {
                recreation_activity_code: 1,
                description: 'Activity Description',
              },
            ],
          },
        },
        {
          name: 'Maps and location',
          input: { spatial_feature_geometry: ['some-geometry'] },
        },
        {
          name: 'Additional fees',
          input: {
            additional_fees: [
              {
                fee_amount: 10,
              },
            ],
          },
        },
        {
          name: 'Facilities',
          input: {
            recreation_structure: { has_toilet: true, has_table: true },
          },
        },
      ])(
        'conditionally shows section link for $name',
        async ({ input, name }) => {
          await renderComponent({
            rec_resource_id: 'REC1234',
            name: 'Resource Name',
          });

          expect(
            screen.queryByRole('link', {
              name,
            }),
          ).not.toBeInTheDocument();

          await renderComponent({
            ...mockResource,
            ...input,
          });

          expect(
            screen.getByRole('link', {
              name,
            }),
          ).toBeInTheDocument();
        },
      );
    });
  });

  describe('RecResourcePage - Recreation Site Info Alert', () => {
    test.each([
      {
        name: "shows InfoAlert when rec_resource_type is 'Recreation site'",
        rec_resource_type: 'Recreation site',
      },
      {
        name: "does not show InfoAlert when rec_resource_type is not 'Recreation site'",
        rec_resource_type: 'Recreation trail',
      },
      {
        name: 'does not show InfoAlert when rec_resource_type is undefined',
        rec_resource_type: undefined,
      },
    ])('$name', async ({ rec_resource_type }: any) => {
      await renderComponent({
        ...mockResource,
        rec_resource_type,
      });

      if (rec_resource_type === 'Recreation site') {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      }
    });
  });
});
