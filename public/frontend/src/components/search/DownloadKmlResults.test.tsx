import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Feature } from 'ol';
import { Style } from 'ol/style';
import * as recreationHooks from '@/service/queries/recreation-resource';
import * as recreationMapUtils from '@shared/components/recreation-resource-map';
import DownloadKmlResults from './DownloadKmlResults';

// ─── Safe, Hoistable Mocks ────────────────────────────────────────────────

// Mock react-bootstrap Modal and its subcomponents
vi.mock('react-bootstrap', async () => {
  const actual = await vi.importActual<any>('react-bootstrap');

  return {
    ...actual,
  };
});

// FontAwesome mocks
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => <span {...props}>{icon}</span>,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faExclamationTriangle: 'faExclamationTriangle',
  faInfoCircle: 'faInfoCircle',
}));

// OL / map utilities mock
vi.mock('@shared/components/recreation-resource-map', () => ({
  getMapFeaturesFromRecResource: vi.fn(() => [new Feature()]),
  getLayerStyleForRecResource: vi.fn(() => new Style()), // ✅ valid style
  downloadKMLMultiple: vi.fn(),
  StyleContext: { DOWNLOAD: 'download' },
}));

// Mock React Query hook
vi.mock('@/service/queries/recreation-resource', () => ({
  useRecreationResourcesWithGeometryMutation: vi.fn(() => ({
    data: undefined,
    isSuccess: false,
    isError: false,
    isLoading: false,
    status: 'idle',
  })),
}));

// Mock utility
vi.mock('@/utils/recreationResourceUtils', () => ({
  getRecResourceDetailPageUrl: vi.fn((id: string) => `/details/${id}`),
}));

const mockData = [
  {
    rec_resource_id: 'r1',
    name: 'Trail 1',
    closest_community: 'Mockville',
    recreation_activity: [],
    recreation_facility: [],
    recreation_access: [],
    recreation_fee: [],
    rec_resource_status: 'Open',
    district: 'D1',
    type: 'Trail',
    geometry: {},
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────

describe('DownloadKmlResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refine search button is enabled if search results number is over 400', () => {
    render(
      <DownloadKmlResults
        searchResultsNumber={401}
        ids={[]}
        trackingView="list"
        handleCloseModal={() => {
          return;
        }}
      />,
    );
    expect(screen.queryByTestId('refine-button')).toBeInTheDocument();
    expect(screen.queryByTestId('msg-alert')).toBeInTheDocument();
  });

  it('calls mutateAsync when download clicked', () => {
    const mutateAsyncMock = vi.fn();
    (
      recreationHooks.useRecreationResourcesWithGeometryMutation as vi.Mock
    ).mockReturnValueOnce({
      data: undefined,
      mutateAsync: mutateAsyncMock,
      isSuccess: false,
      isError: false,
      isLoading: false,
      status: 'idle',
    });

    render(
      <DownloadKmlResults
        searchResultsNumber={1}
        ids={['r1']}
        trackingView="list"
        handleCloseModal={() => {
          return;
        }}
      />,
    );

    const downloadBtn = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadBtn);
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it('runs downloadKMLMultiple when data exists', async () => {
    (
      recreationHooks.useRecreationResourcesWithGeometryMutation as vi.Mock
    ).mockReturnValueOnce({
      data: mockData,
      mutateAsync: vi.fn().mockResolvedValue(mockData),
      isSuccess: true,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    render(
      <DownloadKmlResults
        searchResultsNumber={1}
        ids={['r1']}
        trackingView="list"
        handleCloseModal={() => {
          return;
        }}
      />,
    );

    const downloadBtn = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(
        recreationMapUtils.getMapFeaturesFromRecResource,
      ).toHaveBeenCalled();
      expect(recreationMapUtils.getLayerStyleForRecResource).toHaveBeenCalled();
      expect(recreationMapUtils.downloadKMLMultiple).toHaveBeenCalled();
    });
  });
});
