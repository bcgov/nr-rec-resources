import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DownloadKmlResultsModal from './DownloadKmlResultsModal';
import * as recreationHooks from '@/service/queries/recreation-resource';
import * as recreationMapUtils from '@shared/components/recreation-resource-map';

// ─── Safe, Hoistable Mocks ────────────────────────────────────────────────

// Mock react-bootstrap Modal and its subcomponents
vi.mock('react-bootstrap', () => {
  const React = require('react');
  const Modal = ({ show, children, ...props }: any) =>
    show ? React.createElement('div', props, children) : null;

  // Required subcomponents (otherwise undefined)
  Modal.Body = ({ children }: any) => React.createElement('div', {}, children);
  Modal.Footer = ({ children }: any) =>
    React.createElement('div', {}, children);

  return { Modal };
});

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => {
  const React = require('react');
  return {
    FontAwesomeIcon: ({ icon, ...props }: any) =>
      React.createElement('span', props, icon),
  };
});

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faXmark: 'faXmark',
}));

// Mock recreation resource map utils
vi.mock('@shared/components/recreation-resource-map', () => {
  const { Feature } = require('ol');
  const { Style } = require('ol/style');
  return {
    getMapFeaturesFromRecResource: vi.fn(() => [new Feature()]),
    getLayerStyleForRecResource: vi.fn(() => new Style()),
    downloadKMLMultiple: vi.fn(),
    StyleContext: { DOWNLOAD: 'download' },
  };
});

// Mock React Query hook
vi.mock('@/service/queries/recreation-resource', () => ({
  useRecreationResourcesWithGeometry: vi.fn(() => ({
    data: undefined,
    refetch: vi.fn(),
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
    const refetchMock = vi.fn();
    (
      recreationHooks.useRecreationResourcesWithGeometry as vi.Mock
    ).mockReturnValueOnce({
      data: undefined,
      refetch: refetchMock,
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
    expect(refetchMock).toHaveBeenCalled();
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
      recreationHooks.useRecreationResourcesWithGeometry as vi.Mock
    ).mockReturnValueOnce({
      data: mockData,
      refetch: vi.fn(),
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
