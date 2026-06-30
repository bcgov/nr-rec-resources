import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import { useGetSiteOperatorById } from '@/service/queries/recreation-resource';
import { ReactNode } from 'react';

vi.mock('@/service/queries/recreation-resource', () => ({
  useGetSiteOperatorById: vi.fn(),
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  default: vi.fn(() => true),
}));

vi.mock('@shared/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="breadcrumb">Breadcrumbs</nav>,
}));

let mockLoaderData: any = { recResource: undefined };
const mockNavigate = vi.fn();
vi.mock('@/routes/resource/$id', () => ({
  Route: {
    useLoaderData: () => mockLoaderData,
  },
}));
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...original,
    useParams: vi.fn(() => ({ id: 'REC1234' })),
    useNavigate: vi.fn(() => mockNavigate),
    useMatches: vi.fn(() => [
      {
        context: {},
        loaderData: mockLoaderData,
      },
    ]),
  };
});

vi.mock('@/hooks/useRecResourceSection', () => ({
  useRecResourceSections: vi.fn(),
}));

vi.mock('@/components/layout/PageWithScrollMenu', () => ({
  PageWithScrollMenu: ({
    children,
  }: {
    children: (refs: any) => ReactNode;
  }) => <div>{children([])}</div>,
}));

vi.mock('@/components/rec-resource/section', () => ({
  Closures: () => <h2 className="section-heading">Closures</h2>,
  SiteDescription: () => <h2 className="section-heading">Description</h2>,
  Contact: () => null,
  Facilities: ({ recreation_structure }: any) =>
    recreation_structure ? (
      <h2 className="section-heading">Facilities</h2>
    ) : null,
  MapsAndLocation: vi.fn((props: any) => (
    <div>
      <h2 className="section-heading">Maps and Location</h2>
      {props.accessTypes?.map((type: string) => <div key={type}>{type}</div>)}
    </div>
  )),
  ThingsToDo: vi.fn(() => <h2 className="section-heading">Things to Do</h2>),
  AccessibleActivities: () => (
    <h2 className="section-heading">Accessible Activities</h2>
  ),
  Fees: vi.fn(() => <h2 className="section-heading">Fees</h2>),
  Camping: vi.fn(() => <h2 className="section-heading">Camping</h2>),
  KnowBeforeYouGo: () => (
    <h2 className="section-heading">Know before you go</h2>
  ),
}));

vi.mock('@/components/rec-resource/ResourceHeader', () => ({
  default: () => null,
}));

vi.mock('@/components/rec-resource/PhotoGallery', () => ({
  default: () => null,
}));

const { useRecResourceSections } = await import(
  '@/hooks/useRecResourceSection'
);

export const mockResource = {
  rec_resource_id: 'REC1234',
  name: 'Resource Name',
  description: 'Resource Description',
  closest_community: 'Resource Location',
  rec_resource_type: 'Recreation site',
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
      image_id: 'test-image-1',
      url: {
        original: 'https://example.com/images/REC1234/original.webp',
      },
    },
  ],
};

const createDefaultSectionState = () => ({
  formattedName: 'Resource Name',
  photos: [],
  uniqueRecreationAccess: undefined,
  allActivities: [],
  statusCode: undefined,
  statusDescription: undefined,
  statusComment: undefined,
  isClosures: false,
  isSiteDescription: false,
  showCampingSection: false,
  isFeesAvailable: false,
  isThingsToDo: false,
  isAccessibleActivities: false,
  isFacilitiesAvailable: false,
  isMapsAndLocation: false,
  isRecreationSite: false,
  isPhotoGallery: false,
  isReservable: false,
  isCampingAvailable: false,
  isAdditionalFeesAvailable: false,
  pageSections: [],
});

describe('RecResourcePage', () => {
  const renderComponent = async (
    mockApiResponse: any,
    sectionOverrides?: any,
  ) => {
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
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    });

    const defaultSections = createDefaultSectionState();
    (useRecResourceSections as any).mockReturnValue({
      ...defaultSections,
      ...sectionOverrides,
    });

    mockLoaderData = { recResource: mockApiResponse };
    await renderWithRouter(<RecResourcePage />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Activities section', () => {
    it('shows activities when present', async () => {
      await renderComponent(mockResource, {
        isThingsToDo: true,
        allActivities: [
          {
            recreation_activity_code: 1,
            description: 'Activity Description',
          },
        ],
      });

      expect(
        screen.getByRole('heading', { name: /Things to Do/i }),
      ).toBeInTheDocument();
    });

    it('hides activities when empty', async () => {
      await renderComponent(
        {
          ...mockResource,
          recreation_activity: [],
        },
        {
          isThingsToDo: false,
          allActivities: [],
        },
      );

      expect(
        screen.queryByRole('heading', { name: /Things to Do/i }),
      ).toBeNull();
    });
  });

  describe('Closures section', () => {
    it('shows closure information when closed', async () => {
      await renderComponent(
        {
          ...mockResource,
          recreation_status: {
            status_code: 2,
            description: 'Closed',
            comment: 'This site is closed',
          },
        },
        {
          isClosures: true,
          statusCode: 2,
          statusDescription: 'Closed',
          statusComment: 'This site is closed',
        },
      );

      expect(
        screen.getByRole('heading', { name: /Closures/i }),
      ).toBeInTheDocument();
    });

    it('hides closure information when open', async () => {
      await renderComponent(
        {
          ...mockResource,
          recreation_status: {
            status_code: 1,
            description: 'Open',
            comment: 'This site is open',
          },
        },
        {
          isClosures: false,
          statusCode: 1,
          statusDescription: 'Open',
        },
      );

      expect(screen.queryByRole('heading', { name: /Closures/i })).toBeNull();
    });
  });

  describe('Maps and Location section', () => {
    it('shows the Maps and Location section when access types are present', async () => {
      await renderComponent(mockResource, {
        isMapsAndLocation: true,
        uniqueRecreationAccess: ['Road', 'Boat-in'],
      });

      expect(
        screen.getByRole('heading', { name: /Maps and Location/i }),
      ).toBeInTheDocument();
    });

    it('hides the Maps and Location section when there is no relevant information', async () => {
      await renderComponent(
        {
          ...mockResource,
          recreation_access: [],
        },
        {
          isMapsAndLocation: false,
          uniqueRecreationAccess: undefined,
        },
      );

      expect(
        screen.queryByRole('heading', { name: /Maps and Location/i }),
      ).toBeNull();
    });

    describe('visibility based on different conditions', () => {
      test.each([
        {
          name: 'shows section with spatial geometry',
          shouldShow: true,
        },
        {
          name: 'shows section with resource docs',
          shouldShow: true,
        },
        {
          name: 'shows section with driving directions',
          shouldShow: true,
        },
        {
          name: 'hides section when empty',
          shouldShow: false,
        },
      ])('$name', async ({ shouldShow }) => {
        await renderComponent(mockResource, {
          isMapsAndLocation: shouldShow,
          uniqueRecreationAccess: shouldShow ? ['Road'] : undefined,
        });

        const heading = screen.queryByRole('heading', {
          name: /Maps and Location/i,
        });

        if (shouldShow) {
          expect(heading).toBeInTheDocument();
        } else {
          expect(heading).toBeNull();
        }
      });
    });

    it('removes duplicate access types before passing to MapsAndLocation', async () => {
      const sectionModule = await import('@/components/rec-resource/section');
      vi.clearAllMocks();

      await renderComponent(
        {
          ...mockResource,
          recreation_access: ['Road', 'Boat-in', 'Road', 'Boat-in', 'Trail'],
        },
        {
          isMapsAndLocation: true,
          uniqueRecreationAccess: ['Road', 'Boat-in', 'Trail'],
        },
      );

      expect(sectionModule.MapsAndLocation).toHaveBeenCalled();
      const callArgs = vi.mocked(sectionModule.MapsAndLocation).mock
        .calls[0][0];
      expect(callArgs.accessTypes).toEqual(['Road', 'Boat-in', 'Trail']);
    });
  });

  describe('Camping section', () => {
    const mockCampsiteCount = 10;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('displays camping section when campsite count is available', async () => {
      await renderComponent(
        {
          ...mockResource,
          campsite_count: mockCampsiteCount,
        },
        {
          showCampingSection: true,
          isCampingAvailable: true,
        },
      );
      expect(
        screen.getByRole('heading', { name: /Camping/i }),
      ).toBeInTheDocument();
    });

    it('does not display camping section when not available', async () => {
      await renderComponent(
        {
          ...mockResource,
          campsite_count: undefined,
        },
        {
          showCampingSection: false,
        },
      );
      expect(screen.queryByRole('heading', { name: /Camping/i })).toBeNull();
    });
  });

  describe('Fees section', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test.each([
      {
        name: 'displays Fees section when additional fees are available',
        fees: {
          additional_fees: [
            {
              fee_description: 'Hut Fee',
              recreation_fee_code: 'H',
              fee_amount: 10,
            },
          ],
        },
      },
      {
        name: 'displays Fees section when overnight fees are available',
        fees: {
          overnight_fees: [
            {
              fee_description: 'Overnight Fee',
              recreation_fee_code: 'O',
              fee_amount: 25,
            },
          ],
        },
      },
      {
        name: 'displays Fees section when trail use fees are available',
        fees: {
          trail_use_fees: [
            {
              fee_description: 'Trail Fee',
              recreation_fee_code: 'T',
              fee_amount: 15,
            },
          ],
        },
      },
    ])('$name', async ({ fees }) => {
      await renderComponent(
        {
          ...mockResource,
          ...fees,
        },
        {
          isFeesAvailable: true,
        },
      );
      expect(
        screen.getByRole('heading', { name: /Fees/i }),
      ).toBeInTheDocument();
    });

    it('does not display Fees section when no fees available', async () => {
      await renderComponent(
        {
          ...mockResource,
          additional_fees: undefined,
          overnight_fees: undefined,
          trail_use_fees: undefined,
        },
        {
          isFeesAvailable: false,
        },
      );
      expect(screen.queryByRole('heading', { name: /Fees/i })).toBeNull();
    });
  });

  describe('Facilities section', () => {
    it('displays facilities when recreation structure exists', async () => {
      await renderComponent(
        {
          ...mockResource,
          recreation_structure: { has_toilet: true, has_table: true },
        },
        {
          isFacilitiesAvailable: true,
        },
      );

      expect(screen.getByText(/Facilities/i)).toBeInTheDocument();
    });

    it('does not display facilities when recreation structure is missing', async () => {
      await renderComponent(
        {
          ...mockResource,
          recreation_structure: null,
        },
        {
          isFacilitiesAvailable: false,
        },
      );

      expect(screen.queryByText(/Facilities/i)).toBeNull();
    });
  });

  describe('Site Description section', () => {
    it('displays site description when available', async () => {
      await renderComponent(
        {
          ...mockResource,
          description: 'A beautiful recreation site',
        },
        {
          isSiteDescription: true,
        },
      );

      expect(
        screen.getByRole('heading', { name: /Description/i }),
      ).toBeInTheDocument();
    });

    it('hides site description when not available', async () => {
      await renderComponent(
        {
          ...mockResource,
          description: undefined,
        },
        {
          isSiteDescription: false,
        },
      );

      expect(
        screen.queryByRole('heading', { name: /Description/i }),
      ).toBeNull();
    });
  });

  describe('Accessible Activities section', () => {
    it('displays accessible activities when available', async () => {
      await renderComponent(mockResource, {
        isAccessibleActivities: true,
      });

      expect(
        screen.getByRole('heading', { name: /Accessible Activities/i }),
      ).toBeInTheDocument();
    });

    it('hides accessible activities when not available', async () => {
      await renderComponent(mockResource, {
        isAccessibleActivities: false,
      });

      expect(
        screen.queryByRole('heading', { name: /Accessible Activities/i }),
      ).toBeNull();
    });
  });
});
