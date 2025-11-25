import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Feature } from 'ol';
import { Style } from 'ol/style';
import DownloadKmlResultsModal from './DownloadKmlResultsModal';
import * as recreationHooks from '@/service/queries/recreation-resource';
import * as recreationMapUtils from '@shared/components/recreation-resource-map';

// ─── Safe, Hoistable Mocks ────────────────────────────────────────────────

// Mock react-bootstrap Modal and its subcomponents
vi.mock('react-bootstrap', () => {
  const Modal = ({ show, children, ...props }: any) =>
    show ? <div {...props}>{children}</div> : null;

  Modal.Body = ({ children }: any) => <div>{children}</div>;
  Modal.Footer = ({ children }: any) => <div>{children}</div>;

  return { Modal };
});

// FontAwesome mocks
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => <span {...props}>{icon}</span>,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faXmark: 'faXmark',
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

// ─── Tests ────────────────────────────────────────────────────────────────

describe('DownloadKmlResultsModal', () => {
  const setIsOpenMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal content when open', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={3}
        ids={['r1']}
      />,
    );

    expect(screen.getByText('Export map file')).toBeInTheDocument();
    expect(screen.getByText('Download search results (3)')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={false}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={1}
        ids={['r1']}
      />,
    );
    expect(screen.queryByText('Export map file')).not.toBeInTheDocument();
  });

  it('download button is disabled if search results number is over 400', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={401}
        ids={[]}
      />,
    );
    const downloadBtn = screen.getByRole('button', { name: /download/i });
    expect(downloadBtn).toBeDisabled();
    expect(screen.queryByTestId('msg-alert')).toBeInTheDocument();
  });

  it('calls setIsOpen(false) when close button clicked', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={1}
        ids={['r1']}
      />,
    );

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });

  it('calls setIsOpen(false) when cancel button clicked', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={2}
        ids={['r1']}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });

  it('calls refetch when download clicked', () => {
    const mutateMock = vi.fn();
    (
      recreationHooks.useRecreationResourcesWithGeometryMutation as vi.Mock
    ).mockReturnValueOnce({
      data: undefined,
      mutate: mutateMock,
      isSuccess: false,
      isError: false,
      isLoading: false,
      status: 'idle',
    });

    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={1}
        ids={['r1']}
      />,
    );

    const downloadBtn = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadBtn);
    expect(mutateMock).toHaveBeenCalled();
  });

  it('runs downloadKMLMultiple when data exists', async () => {
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

    (
      recreationHooks.useRecreationResourcesWithGeometryMutation as vi.Mock
    ).mockReturnValueOnce({
      data: mockData,
      isSuccess: true,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={1}
        ids={['r1']}
      />,
    );

    await waitFor(() => {
      expect(
        recreationMapUtils.getMapFeaturesFromRecResource,
      ).toHaveBeenCalled();
      expect(recreationMapUtils.getLayerStyleForRecResource).toHaveBeenCalled();
      expect(recreationMapUtils.downloadKMLMultiple).toHaveBeenCalled();
    });
  });
});
